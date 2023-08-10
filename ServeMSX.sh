#!/bin/bash
function ask() {
    if [[ "$1" =~ ^*?$ ]]; then
        read -p "$1 [Y/n]: " -n 1 -r && echo && [[ "$REPLY" =~ ^[Nn]$ ]] && return 1 || return 0
    else
        read -r -p "$1: " && [ -z "$REPLY" ] && return 1 || return 0
    fi
}
function dnl() {
    curl -L -o "$1" "$2" || wget -O "$1" "$2"
    return
}
[ $EUID -ne 0 ] && echo "Please run me as root!" && exit 1
EXE=ServeMSX
DIR=/opt/$EXE
[ -z "$1" ] || DIR=$1
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

echo -n "Loading $URI/$ARC to $DIR/$EXE..."
[ -d $DIR ] || mkdir $DIR || exit
dnl $DIR/$EXE $URL/$ARC || exit
echo "done"

if [ -n "$SYS" ] && ask "Would you like to install $EXE as a service?"
then 
    case $SYS in
        systemd)
            ask "Address to listen to (leave blanc to use ':80')"
            echo -n "Installing and disbling the service..."
            systemctl -q --now disable $EXE
            dnl $DIR/$EXE.service $URI/$EXE.service || exit
            while read line; do
                case line in
                    WorkingDirectory=*) echo "WorkingDirectory=$DIR";;
                    ExecStart=*)        echo "ExecStart=$DIR/$EXE -t $REPLY";;
                    *)                  echo "$line";;
                esac
            done < $DIR/$EXE.service > /etc/systemd/system/$EXE.service
            rm $DIR/$EXE.service
            systemctl daemon-reload
            systemctl --now enable $EXE
            echo "done"
            ;;
    esac
fi

if ask "Would you like to setup $EXE?"
then
    for md in video music photo
    do
        ask "Enter absulute path to share $md files (leave blanc to skip)" && ln -s "$REPLY" $DIR/$md
    done
    ask "Enter the address (<IP>:<PORT>) of TorrServer (if it's not used or runs on this machine on port 8090, leave blanc)" && echo "http://$REPLY" > $DIR/torrserver
fi

echo Done!
