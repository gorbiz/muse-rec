Record EEG data (OSC stream) from Muse (through the Mind Monitor Android app).

# Up and running
```sh
# sudo mkdir -p .data/influxdb .data/chronograf-storage # is this really needed?
docker-compose up -d
```

## Without storing data

```sh
nodemon index.js
```

# Configure Mind Monitor
...to communicate with this backend.

