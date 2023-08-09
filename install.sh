#/bin/bash
EXE=ServeMSX
DIR=/opt/$EXE
URI=https://damiva.github.io/$EXE.linux
case $(uname -m) in
    armv7*)
        URI=$URI.arm;;
    x86_64)
        URI=$URI.amd64;;
    *)
        echo "Your architecture is not supported!" && exit 1;;
esac

[ "$EUID" -ne 0 ] && echo "Please run me as root!" && exit 1

[ -d $DIR ] || mkdir $DIR || exit
wget -O $DIR/$EXE $URI || curl -o $DIR/$EXE $URI || exit

command -v systemctl >/dev/null && echo "Should $EXE be installed as a service? [Y/n]:" && read && [ "$REPLY" -ne "n" ] || exit 0

systemctl stop $EXE
echo "Enter the address ([IP]:<PORT>) to listen to (leave blanc to use ':80'):" && read -r
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

for md in video music photo
do
    echo "Enter absulute path to share $md files (leave blanc to skip):" && read -r
    rm $DIR/$md
    ln -s "$REPLY" $DIR/$md || echo "Error: $?"
done
echo Done!