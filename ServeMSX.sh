#/bin/bash
function ask() {
    echo -n "$1? [Y/n]: " && read && [[ "$REPLY" -eq "n" ]] && return 1 || return 0
}

EXE=ServeMSX
DIR=/opt/$EXE
URI=https://damiva.github.io/$EXE
if [ ! -z "$1" ]; then DIR=$1; fi
read SYS ARC <(uname -s -m)
case $ARC in
    armv7*) ARC=arm;;
    x86_64) ARC=amd64;;
    *) echo "Your architecture is not suppported" && exit 1;;
esac
case $SYS in
    Linux) 
        ARC=linux.$ARC
        command -v systemctl >/dev/null || SYS=""
        ;;
    *) echo "Your OS is not supported!" && exit 1;;
esac

[ "$EUID" -ne 0 ] && echo "Please run me as root!" && exit 1

[ -d $DIR ] || mkdir $DIR || exit
curl -L -o $DIR/$EXE $URI/$ARC || exit

if [ ! -z "$SYS" ] && ask "Would you like to install $EXE as a service"; then 
    case $SYS in
        Linux)
            systemctl stop $EXE
            echo -n "Address to listen to (lieave blanc to use ':80'): " && read -r PRT
            get $DIR/$EXE.service $URI/$EXE.service || exit
            while read line; do
                case line in
                    WorkingDirectory=*) echo "WorkingDirectory=$DIR";;
                    ExecStart=*)        echo "ExecStart=$DIR/$EXE -t $PRT";;
                    *)                  echo "$line";;
                esac
            done < (curl -L -s $URI/$EXE.service) > /etc/systemd/system/$EXE.service
            systemctl daemon-reload
            systemctl enable $EXE
            systemctl start $EXE
            ;;
    esac
fi

if ask "Would you like to setup $EXE"; then
    for md in video music photo
    do
        echo -n "Enter absulute path to share $md files (leave blanc to skip): "
        read -r
        [ -z "$REPLY" ] || ln -s "$REPLY" $DIR/$md
    done
    echo -n "Enter the address (<IP>:<PORT>) of TorrServer (if it's not used or runs on this machine on port 8090, leave blanc): "
    read -r
    [ -z "$REPLY" ] || echo "http://$REPLY" > $DIR/torrserver
fi

echo Done!
