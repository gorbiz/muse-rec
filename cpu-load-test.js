const os = require('os')
const Influx = require('influx')
const influx = new Influx.InfluxDB(process.env.INFLUXDB_URI)

function measure () {
  const [avg1, avg5, avg15] = os.loadavg()
  console.log('logging: ', [avg1, avg5, avg15])
  influx.writeMeasurement('cpu_load', [{
    tags: { host: os.hostname() },
    fields: { avg1, avg5, avg15 }
  }]).catch(err => {
    console.error(`Error saving data to InfluxDB! ${err.stack}`)
  })
}

measure()
setInterval(measure, 1 * 1000)
