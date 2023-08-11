#!/bin/sh
### BEGIN INIT INFO
# Provides:
# Required-Start:    $local_fs $remote_fs $network
# Required-Stop:     $local_fs $remote_fs $network
# Default-Start:     2 3 4 5
# Default-Stop:      0 1 6
# Short-Description: ServeMSX
# Description:       Media Server for Media Station X.
### END INIT INFO
name=`basename $0`
dir=/opt/$name
cmd=$name
opt=""

fpid="/var/run/$name.pid"
flog="/var/log/$name.log"

get_pid() {
    cat "$fpid"
}
is_running() {
    [ -f "$fpid" ] && ps -p `get_pid` > /dev/null 2>&1
}

case $1 in
    start)
    if is_running; then
        echo "Already started"
    else
        echo "Starting $name"
        cd "$dir"
        sudo $cmd $opt 2>> "$flog" &
        echo $! > "$fpid"
        if ! is_running; then
            echo "Unable to start, see log ($flog)"
            exit 1
        fi
    fi
    ;;
    stop)
    if is_running; then
        echo -n "Stopping $name.."
        kill `get_pid`
        for i in 1 2 3 4 5 6 7 8 9 10
        # for i in `seq 10`
        do
            if ! is_running; then
                break
            fi
            echo -n "."
            sleep 1
        done
        echo
        if is_running; then
            echo "Not stopped; may still be shutting down or shutdown may have failed"
            exit 1
        else
            echo "Stopped"
            [ -f "$fppid" ] && rm "$fpid"
        fi
    else
        echo "Not running"
    fi
    ;;
    restart) $0 stop && $0 start || exit;;
    status) is_running && echo "Running (see: $flog)" || echo "Stopped (see: $flog)" && exit 1;;
    *) echo "Usage: $0 {start|stop|restart|status}" && exit 1;;
esac
exit 0