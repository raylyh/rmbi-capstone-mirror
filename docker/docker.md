1. To build docker image
```
docker build -t mysql:latest setup
```

2. To create a new container from image
```
docker run --hostname network_analysis --name network_analysis -p 7000:7000 -it --restart unless-stopped mysql:latest /bin/bash -c 'service cron start ;bash'
```

Open a port at 7000:7000
