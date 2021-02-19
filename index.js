const Influx = require('influx')
const os = require('os')
const osc = require('osc-min')
const udp = require('dgram')

const fieldsNameMap = {
  '/muse/eeg': ['RAW_TP9', 'RAW_AF7', 'RAW_AF8', 'RAW_TP10', 'AUX_RIGHT'],

  // NOTE "Can be One Average or Four Float values" - we only support the 4 floats
  '/muse/elements/delta_absolute': ['Delta_TP9', 'Delta_AF7', 'Delta_AF8', 'Delta_TP10'],
  '/muse/elements/theta_absolute': ['Theta_TP9', 'Theta_AF7', 'Theta_AF8', 'Theta_TP10'],
  '/muse/elements/alpha_absolute': ['Alpha_TP9', 'Alpha_AF7', 'Alpha_AF8', 'Alpha_TP10'],
  '/muse/elements/beta_absolute': ['Beta_TP9', 'Beta_AF7', 'Beta_AF8', 'Beta_TP10'],
  '/muse/elements/gamma_absolute': ['Gamma_TP9', 'Gamma_AF7', 'Gamma_AF8', 'Gamma_TP10'],

  '/muse/elements/horseshoe': ['HSI_TP9', 'HSI_AF7', 'HSI_AF8', 'HSI_TP10'], // 1=Good, 2=Medium, 4=Bad
  '/muse/elements/touching_forehead': ['HeadBandOn'], // 1=True, 0=False
  '/muse/batt': ['BatteryInfo'], // XXX not same as Battery in CSV export (that has only charge percentage)
  '/muse/gyro': ['Gyro_X', 'Gyro_Y', 'Gyro_Z'],
  '/muse/acc': ['Accelerometer_X', 'Accelerometer_Y', 'Accelerometer_Z'],
  '/muse/elements/blink': ['Blink'], // Under "Elements" in CSV export (1=Blink)
  '/muse/elements/jaw_clench': ['Jaw_Clench'], // Under "Elements" in CSV export (1=Jaw Clench)

  // Under "Elements" in CSV export - triggered by tapping in the Mind Monitor app (1=True)
  '/Marker/1': ['Marker_1'],
  '/Marker/2': ['Marker_2'],
  '/Marker/3': ['Marker_3'],
  '/Marker/4': ['Marker_4'],
  '/Marker/5': ['Marker_5']
}

const influxdbUri = process.env.INFLUXDB_URI
const influx = influxdbUri && new Influx.InfluxDB(process.env.INFLUXDB_URI)

const host = os.hostname()

const cache = {}
const sock = udp.createSocket('udp4', function (msg, rinfo) {
  try {
    const data = osc.fromBuffer(msg)
    data.elements.map(element => {
      const fields = {}

      const fieldsNames = fieldsNameMap[element.address]
      if (!fieldsNames) {
        console.error('Unexpected / unknown data:', element)
        return
      }

      const values = element.args.map(arg => arg.value)
      for (let i = 0; i < fieldsNames.length; i++) fields[fieldsNames[i]] = values[i]
      // console.log(fields)

      if (influxdbUri) influx.writeMeasurement('eeg', [{ tags: { host }, fields }])

      cache[element.address] = values
    })
    return
  } catch (error) {
    return console.log('invalid OSC packet', error)
  }
})
sock.bind(7980)

if (process.env.LOGGING !== '0') {
  let last = 0
  setInterval(() => {
    process.stdout.write('\033c')
    last = 0
    for (const [key, val] of Object.entries(cache)) {
      process.stdout.write(`${key.replace('/elements/', '/')}:\t ${val.join(', \t')}\n`)
      last++
    }
  }, 1000)
}