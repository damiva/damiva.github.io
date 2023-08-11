#!/bin/bash
[ $EUID -ne 0 ] && echo "Please run me as root!" && exit 1
EXE=ServeMSX
case $1 in
    )   DIR=/opt/$EXE;;
    .)  DIR=$PWD;;
    *)  DIR=$1;;
esac
URI=https://damiva.github.io/$EXE
read -r SYS ARC < <(uname -s -m)
case $ARC in
    aarch64*)   ARC=arm64;;
    armv8*)     ARC=arm64;;
    arm*)       ARC=arm;;
    x86_64)     ARC=amd64;;
    *) echo "Your arch '$ARC' is not suppported at this time!" && exit 1;;
esac
case $SYS in
    Linux)      SYS=linux;;
    Darwin)     SYS=darwin;;
    *) echo "Your OS '$SYS' is not supported at this time!" && exit 1;;
esac

[ -d $DIR ] || mkdir $DIR || exit
curl -L -o $DIR/$EXE $URI/$SYS.$ARC && chmod +x $DIR/$EXE || exit

if read -p "Would you like to configure $EXE? [Y/n]: " -n 1 -r && [[ ! $REPLY =~ ^[Nn]$ ]]
then
    for md in video music photo
    do
        read -p "Enter absulute path to share $md files (leave blanc to skip): " -r && [ -n "$REPLY" ] && ln -s "$REPLY" $DIR/$md
    done
    read -p "Enter the address (<IP>:<PORT>) of TorrServer (if it's not used or runs on this machine on port 8090, leave blanc): " && [ -n "$REPLY" ] && echo "http://$REPLY" > $DIR/torrserver
fi

if read -p "Would you like to install $EXE as a service? [Y/n]: " -n 1 -r && [[ ! $REPLY =~ ^[Nn]$ ]]
then
    read -r -p "Address to listen to (leave blanc to use default http): " PRT
    if [[ "$SYS" == "linux" ]]; then SYS=$(ps --no-headers -o comm 1); fi
    case $SYS in
        systemd)
            systemctl -q --now disable $EXE
            while read line; do
                case $line in
                    WorkingDirectory=*) echo "WorkingDirectory=$DIR";;
                    ExecStart=*) echo "ExecStart=$DIR/$EXE -t $PRT";;
                    *) echo "$line"
                esac
            done < <(curl -L -s $URI/$EXE.service) > /etc/systemd/system/$EXE.service
            systemctl daemon-reload
            systemctl --now enable $EXE
            ;;
        *) echo "Your service system '$SYS' is not supported at this time!" && exit 1;;
    esac
fi

echo Done!
