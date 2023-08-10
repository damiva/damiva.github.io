#!/bin/bash
function ask() {
    read -p "$1? [Y/n]: " && [ "$REPLY" -eq "n" ] && return 1 || return 0
}
EXE=ServeMSX
DIR=/opt/$EXE
if [ ! -z "$1" ]; then DIR=$1; fi
URI=https://damiva.github.io/$EXE
case $(arch) in
    armv7*) ARC=arm;;
    x86_64) ARC=amd64;;
    *) echo "Your arch is not supported!" && exit 1;;
esac
case $(uname) in
    Linux)
        ARC=linux.$ARC
        command -v systemctl >/dev/null && SYS="systemd"
        ;;
    *)
        echo "Your OS is not supported!" && exit 1
        ;;
esac
[ $EUID -ne 0 ] && echo "Please run me as root!" && exit 1

echo -n "Loading $URI/$ARC to $DIR/$EXE..."
[ -d $DIR ] || mkdir $DIR || exit
curl -L -o $DIR/$EXE $URI/$ARC || wget -O $DIR/$EXE $URI/$ARC || exit
echo "done"

if [ ! -z "$SYS" ] && read -p "Would you like to install $EXE as a service? [Y/n]: " && [ "$REPLY" -ne "n" ]
then 
    case $SYS in
        systemd)
            systemctl stop $EXE
            read -r -p "Address to listen to (leave blanc to use ':80'): " PRT
            echo -n "Creating service file..."
            while read line; do
                case line in
                    WorkingDirectory=*) echo "WorkingDirectory=$DIR";;
                    ExecStart=*)        echo "ExecStart=$DIR/$EXE -t $PRT";;
                    *)                  echo "$line";;
                esac
            done < $URI/$EXE.service > /etc/systemd/system/$EXE.service
            echo -e -n "done\nEnabling and starting the service..."
            systemctl daemon-reload
            systemctl enable $EXE
            systemctl start $EXE
            echo "done"
            ;;
    esac
fi

if read -p "Would you like to setup $EXE? [Y/n]: " && [ "$REPLY" -ne "n" ]; then
    for md in video music photo
    do
        read -r -p "Enter absulute path to share $md files (leave blanc to skip): "
        [ -z "$REPLY" ] || ln -s "$REPLY" $DIR/$md
    done
    read -r -p "Enter the address (<IP>:<PORT>) of TorrServer (if it's not used or runs on this machine on port 8090, leave blanc): "
    [ -z "$REPLY" ] || echo "http://$REPLY" > $DIR/torrserver
fi

echo Done!
