#/bin/bash
function ask(){
    echo "$1? [Y/n]:" && read && [[ "$REPLY" -eq "n" ]] && return 1 || return 0
}

EXE=ServeMSX
DIR=/opt/$EXE
URI=https://damiva.github.io/$EXE.linux
case $(uname -m) in
    armv7*) URI=$URI.arm;;
    x86_64) URI=$URI.amd64;;
    *) echo "Your architecture is not supported!" && exit 1;;
esac

[ "$EUID" -ne 0 ] && echo "Please run me as root!" && exit 1

[ -d $DIR ] || mkdir $DIR || exit
wget -O $DIR/$EXE $URI || curl -o $DIR/$EXE $URI || exit

if command -v systemctl >/dev/null && ask "Would you like to install $EXE as a service"
then
echo "Enter the address ([IP]:<PORT>) to listen to (leave blanc to use ':80'):" && read -r
systemctl stop $EXE
if ! cat << EOF > /etc/systemd/system/$EXE.service
[Unit]
Description=Media server for Media Station X
Requires=network.target
After=network-online.target syslog.target
[Service]
Type=simple
WorkingDirectory=$DIR
ExecStart=$DIR/$EXE -t $REPLY
Restart=on-success
[Install]
WantedBy=multi-user.target
EOF
then
    exit
fi
systemctl daemon-reload
systemctl enable $EXE
systemctl start $EXE
fi

if ask "Would you like to setup $EXE"
then
for md in video music photo
do
    echo "Enter absulute path to share $md files (leave blanc to skip):" && read -r
    rm $DIR/$md
    ln -s "$REPLY" $DIR/$md || echo "Error: $?"
done
echo "Enter the address (<IP>:<PORT>) of TorrServer (if it's not used or runs on this machine on port 8090, leave blanc):"
read -r
if [ -z "$REPLY" ]; then; echo "http://$REPLY" > $DIR/torrserver; fi
fi

echo Done!