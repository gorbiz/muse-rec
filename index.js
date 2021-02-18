const Influx = require('influx')
const os = require('os')
const osc = require('osc-min')
const udp = require('dgram')

const host = os.hostname()
const influx = new Influx.InfluxDB(process.env.INFLUXDB_URI)

const derp = {}
const sock = udp.createSocket('udp4', function (msg, rinfo) {
  try {
    const data = osc.fromBuffer(msg)
    data.elements.map(element => {
      if (element.address === '/muse/eeg') {
        const [tp9, af7, af8, tp10, aux] = element.args.map(arg => arg.value)
        // console.log([tp9, af7, af8, tp10, aux])
        influx.writeMeasurement('eeg', [{
          tags: { host },
          fields: { tp9, af7, af8, tp10, aux }
        }]).catch(err => {
          console.error(`Error saving data to InfluxDB! ${err.stack}`)
        })
      }
      // if (element.address === '/muse/eeg') console.log(new Date(), element.args.map(arg => arg.value).join(',\t'))
      // if (element.address === '/muse/eeg') console.log(element)
      derp[element.address] = element.args.map(arg => arg.value)
    })
    return
  } catch (error) {
    return console.log('invalid OSC packet', error)
  }
})
sock.bind(7980)

// let last = 0
// setInterval(() => {
//   process.stdout.write('\033c')
//   last = 0
//   for (const [key, val] of Object.entries(derp)) {
//     // process.stdout.write(`${key.replace('/elements/', '/')}:\t ${val.join(', \t')}\n`)
//     last++
//   }
// }, 100)

// function measure () {
//   const [avg1, avg5, avg15] = os.loadavg()
//   // console.log('logging: ', [avg1, avg5, avg15])
//   influx.writeMeasurement('cpu_load', [
//     {
//       tags: { host: os.hostname() },
//       fields: { avg1, avg5, avg15 }
//     }]).catch(err => {
//     console.error(`Error saving data to InfluxDB! ${err.stack}`)
//   })
// }

// measure()
// setInterval(measure, 60 * 1000)
