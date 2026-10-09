// Board data for the /demos/pcbs slideshow. Transcribed from the
// home-automation-pcbs README (github.com/AskAlice/home-automation-pcbs,
// commit 102b9fb, 2026-09-25). The AI Studio draft's version of this list had
// specs that contradict the repo (SPS30 on AirQuality, CR2450 on ThreadNode,
// ST7789 on LEDHub, a 16 A relay on RelayMini), so none of its copy is used.
// Re-sync from the README when boards change.

export const PCB_REPO = 'https://github.com/AskAlice/home-automation-pcbs'

export interface PcbBoard {
  id: string
  name: string
  /** one-line function, from the README board table */
  role: string
  mcu: string
  ecosystem: string
  /** status column of the README board table */
  status: string
  /** short bullets from the README showcase section */
  details: string[]
  /** headline parts from the README "Key parts" line */
  parts: string[]
  /** path of the ESPHome/firmware config inside the repo */
  firmware: string
  /** mains or other hazard note, shown prominently */
  warning?: string
  /** whether public/demos/pcbs/<id>/turntable.gif exists */
  turntable: boolean
}

export const PCB_BOARDS: PcbBoard[] = [
  {
    id: 'sensenode-c6',
    name: 'SenseNode C6',
    role: 'Environmental multisensor',
    mcu: 'ESP32-C6-WROOM-1',
    ecosystem: 'ESPHome (Wi-Fi) + Matter/Thread',
    status: 'v0.1 routed (power), partial ratsnest',
    details: [
      'One-per-room node. The C6 has Wi-Fi 6, BLE 5 and 802.15.4, so one board runs ESPHome today and Matter-over-Thread later.',
      'USB-C 5 V into an AP2112K-3.3 LDO; EN/BOOT buttons; 1×4 programming header.',
    ],
    parts: ['SHT31 temp/humidity', 'BH1750 lux', 'BMP280 pressure', 'AM312 PIR'],
    firmware: 'boards/sensenode-c6/esphome/sensenode-c6.yaml',
    turntable: true,
  },
  {
    id: 'presencepro-c3',
    name: 'PresencePro C3',
    role: 'mmWave presence + lux',
    mcu: 'ESP32-C3-WROOM-02',
    ecosystem: 'ESPHome',
    status: 'v0.1',
    details: [
      'Still-presence detection (sitting at a desk, sleeping) where PIR fails, gated on ambient light.',
      'USB-C 5 V into an AP2112K-3.3; native USB flashing.',
    ],
    parts: ['HLK-LD2410B 24 GHz radar', 'BH1750 lux'],
    firmware: 'boards/presencepro-c3/esphome/presencepro-c3.yaml',
    turntable: true,
  },
  {
    id: 'ledquad-c3',
    name: 'LEDQuad C3',
    role: '4-channel 12–24 V PWM LED driver',
    mcu: 'ESP32-C3-WROOM-02',
    ecosystem: 'ESPHome / WLED',
    status: 'v0.1',
    details: [
      'Analog RGBW strip driver sized to hide behind furniture.',
      '12–24 V in (fused) into an AP63205 5 V buck and AP2112 3.3 V; USB-C programming diode-OR’d with the buck rail.',
    ],
    parts: ['4× AO3400A low-side MOSFETs', 'AP63205 buck', '5.08 mm screw terminals'],
    firmware: 'boards/ledquad-c3/esphome/ledquad-c3.yaml',
    turntable: true,
  },
  {
    id: 'relaymini-c3',
    name: 'RelayMini C3',
    role: 'Mains switch + energy metering',
    mcu: 'ESP32-C3-WROOM-02',
    ecosystem: 'ESPHome',
    status: 'v0.1, safety gates green',
    details: [
      'Inline switch with a fused input, MOV, ≥ 6 mm creepage and a milled isolation slot between mains and SELV.',
      'BL0942 metering (V/A/W/Wh/PF) over a PC817 opto-isolated UART; programming header on the SELV side only.',
    ],
    parts: ['HF32F-G relay, 10 A/250 VAC', 'BL0942 meter', 'HLK-PM01 AC/DC', '2× PC817'],
    firmware: 'boards/relaymini-c3/esphome/relaymini-c3.yaml',
    warning: '110–240 VAC mains board. Lethal voltages — qualified builders only.',
    turntable: true,
  },
  {
    id: 'ledhub-c6',
    name: 'LEDHub C6',
    role: 'All-in-one display LED controller (flagship)',
    mcu: 'ESP32-C6-WROOM-1',
    ecosystem: 'WLED / ESPHome',
    status: 'v0.1 (flagship)',
    details: [
      'Addressable-LED control station running WLED with a custom usermod: status display, physical controls, presence-aware switching.',
      '2.8" ILI9341 TFT, EC11 encoder, 5-way nav buttons on one ADC pin; WS2812 data through a 74AHCT125 level shifter.',
    ],
    parts: ['ILI9341 2.8" TFT', 'INMP441 I2S mic', 'LD2450 radar header', 'SHT31 + BH1750'],
    firmware: 'firmware/wled-usermod-ledhub',
    turntable: true,
  },
  {
    id: 'threadnode-h2',
    name: 'ThreadNode H2',
    role: 'Battery Thread contact sensor / button',
    mcu: 'ESP32-H2-MINI-1',
    ecosystem: 'Matter-over-Thread / Zigbee',
    status: 'v0.1 concept',
    details: [
      '802.15.4-only, built for deep sleep: a door/window sensor or smart button.',
      'Runs straight off a CR2032 (no LDO); the reed switch wakes it from deep sleep.',
    ],
    parts: ['CR2032 holder', 'Reed input', 'I2C expansion header'],
    firmware: 'Matter-over-Thread via esp-matter (see board README)',
    turntable: true,
  },
  {
    id: 'airquality-s3',
    name: 'AirQuality S3',
    role: 'CO₂ / VOC / temp / humidity',
    mcu: 'ESP32-S3-WROOM-1',
    ecosystem: 'ESPHome',
    status: 'v0.1 concept',
    details: [
      'Photoacoustic CO₂ and metal-oxide VOC on one I2C bus.',
      'Header for a 0.96" SSD1306 OLED readout.',
    ],
    parts: ['Sensirion SCD40 CO₂', 'SGP40 VOC index', 'SHT40 temp/humidity'],
    firmware: 'boards/airquality-s3/esphome/airquality-s3.yaml',
    turntable: true,
  },
  {
    id: 'blinddriver-c6',
    name: 'BlindDriver C6',
    role: 'TMC2209 roller-blind controller',
    mcu: 'ESP32-C6-WROOM-1',
    ecosystem: 'ESPHome / Matter',
    status: 'v0.1 concept',
    details: [
      'Quiet Trinamic stepper control with ESPHome cover semantics.',
      '12 V VMOT with SS34 reverse-polarity protection; 12 V → 5 V → 3.3 V power chain.',
    ],
    parts: ['TMC2209 socket', 'AP63205 buck', 'End-stop header'],
    firmware: 'boards/blinddriver-c6/esphome/blinddriver-c6.yaml',
    turntable: true,
  },
  {
    id: 'irblaster-c3',
    name: 'IRBlaster C3',
    role: 'IR climate bridge',
    mcu: 'ESP32-C3-WROOM-02',
    ecosystem: 'ESPHome',
    status: 'v0.1 concept',
    details: [
      'Gives a dumb IR A/C or heater an ESPHome climate_ir entity, with receive to learn the remote’s codes.',
    ],
    parts: ['2× TSAL6200 IR LEDs', 'TSOP38238 38 kHz receiver', 'Optional BH1750'],
    firmware: 'boards/irblaster-c3/esphome/irblaster-c3.yaml',
    turntable: true,
  },
  {
    id: 'gardenprobe-c6',
    name: 'GardenProbe C6',
    role: 'Battery soil-moisture stick',
    mcu: 'ESP32-C6-WROOM-1',
    ecosystem: 'ESPHome / Matter',
    status: 'v0.1 concept',
    details: [
      'A 70 × 25 mm stick where the PCB is the probe: a capacitive copper area on the tip, corrosion-free versus resistive probes.',
      '3.7 V LiPo into an MCP1700 LDO; SHT31 on a load-switched rail to save battery.',
    ],
    parts: ['Capacitive probe', 'SHT31', 'MCP1700 LDO', 'AO3401 load switch'],
    firmware: 'boards/gardenprobe-c6/esphome/gardenprobe-c6.yaml',
    turntable: true,
  },
  {
    id: 'threadrcp-h2',
    name: 'ThreadRCP H2',
    role: 'OpenThread border-router dongle',
    mcu: 'ESP32-H2-MINI-1',
    ecosystem: 'OpenThread RCP / Zigbee NCP',
    status: 'v0.1 concept',
    details: [
      '35 × 20 mm USB-C dongle that turns a Home Assistant box into an OpenThread Border Router.',
      'Native USB transport, no UART bridge chip; antenna overhangs the board edge.',
    ],
    parts: ['ESP32-H2-MINI-1', 'USB-C', 'AP2112K-3.3'],
    firmware: 'Espressif ot_rcp example (flash command in board README)',
    turntable: true,
  },
  {
    id: 'garagepilot-c6',
    name: 'GaragePilot C6',
    role: 'Garage-door relay + 3× inputs',
    mcu: 'ESP32-C6-WROOM-1',
    ecosystem: 'ESPHome',
    status: 'v0.1 routed, DRC/ERC issues',
    details: [
      'Dry-contact controller: closes a low-voltage relay across the opener’s wall-button terminals.',
      'Reads door-closed / door-open reed switches and a safety beam; USB-C or 5 V terminal power.',
    ],
    parts: ['SRD-05VDC-SL-C SPDT relay', 'AO3400A driver', '3× pulled-up inputs'],
    firmware: 'boards/garagepilot-c6/esphome/garagepilot-c6.yaml',
    warning: 'KiCad DRC still reports violations on this board — check its README before ordering.',
    turntable: false,
  },
]

/** Public paths for a board's media (served from public/demos/pcbs). */
export function pcbMedia(b: PcbBoard): { render: string; turntable: string | null } {
  return {
    render: `/demos/pcbs/${b.id}/render3d_top.png`,
    turntable: b.turntable ? `/demos/pcbs/${b.id}/turntable.gif` : null,
  }
}

/** Wrap-around index step for prev/next. */
export function stepIndex(i: number, delta: number, n: number): number {
  return ((i + delta) % n + n) % n
}
