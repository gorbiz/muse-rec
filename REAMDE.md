
# Up and running
```sh
echo GRAFANA_USERNAME=username-here > .env
echo GRAFANA_PASSWORD=password-here >> .env

sudo mkdir -p .data/influxdb .data/grafana .data/grafana-provisioning/ .data/chronograf-storage
docker-compose up -d
```
