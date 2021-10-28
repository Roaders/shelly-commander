# Shelly Commander

![Shelly Commander Screen Shot](readme-assets/screen-shot.JPG)

A tool that scans a range of IPs looking for shelly devices allowing you to more easily manage them.

## How It Works

It makes a request to [`/shelly`](https://shelly-api-docs.shelly.cloud/gen1/#shelly) endpoint on every IP address and if a request is received adds it to the list of shellies displaying ip address, host name, name, type and mac address.

If an error is received the address is added to the `possible shellies` list. If the shelly devices does not have `cross origin resource sharing` switched on then it will appear in this list. the `Enable CORS` button can be used to attempt to switch this on so that you can see manage your shelly device.