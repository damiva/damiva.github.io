#!/bin/bash
[ $EUID -ne 0 ] && echo "Please run me as root!" && exit 1
EXE=ServeMSX
DIR=/opt/$EXE
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

function Download(){
    uri=https://damiva.github.io/$EXE
    curl -L -o $2 $uri/$1 || wget -O $2 $uri/$1
    return
}

[ -d $DIR ] || mkdir $DIR || exit
Download $SYS.$ARC $DIR/$EXE && chmod +x $DIR/$EXE || exit

read -p "Would you like to install $EXE as a service? [Y/n]: " -n 1 -r && [[ $REPLY =~ ^[Nn]$ ]] && exit 0

SYS=($(ps -c -o comm 1)) && SYS=${SYS[1]} || exit
case $SYS in
    systemd)
        ARC=/etc/systemd/system/$EXE.service
        systemctl -q --now disable $EXE
        Download $EXE.service $ARC && systemctl daemon-reload && systemctl --now enable $EXE || exit
        ;;
    init)
        ARC=/etc/init.d/$EXE
        /etc/init.d/$EXE stop >/dev/null
        Download $EXE.sh $ARC && chmod +x $ARC && service $EXE start || exit
        ;;
    launchd)
        ARC=/Library/LaunchDaemons/damiva.$EXE.plist
        launchctl unload -w $ARC >/dev/null
        Download $EXE.plist$ARC && launchctl load -w $ARC || exit
        ;;
    *) echo "Your service system '$SYS' is not supported at this time!" && exit 1;;
esac

echo Done!
