// Roster shown only in the emu LLC variant (VITE_EMU_LLC).
export interface Member {
  name: string
  role: string
  type: 'employee' | 'contractor'
  blurb: string
  color: string
}

export const TEAM: Member[] = [
  {
    name: 'Alice Knag',
    role: 'Founder · Engineer',
    type: 'employee',
    blurb:
      'Runs emu LLC end to end — hardware incubator, web systems, and everything shipped under the emu.sh umbrella.',
    color: '#6ee7b7',
  },
  {
    name: 'Contractor 1',
    role: 'PCB Layout',
    type: 'contractor',
    blurb: 'Board bring-up and layout for the ESP32-C3/C6/S3/H2 room-node swarm.',
    color: '#ff8aa0',
  },
  {
    name: 'Contractor 2',
    role: 'Firmware',
    type: 'contractor',
    blurb: 'ESPHome, Matter/Thread, and Zigbee device firmware.',
    color: '#8fc9f5',
  },
  {
    name: 'Contractor 3',
    role: 'Industrial Design',
    type: 'contractor',
    blurb: 'Enclosures, DFM feedback, and assembly partner coordination.',
    color: '#f5a66f',
  },
  {
    name: 'Contractor 4',
    role: 'Growth · E-commerce',
    type: 'contractor',
    blurb: 'Tindie, eBay, and Amazon storefront ops and channel growth.',
    color: '#ffd47e',
  },
]

export const TEAM_SUMMARY = '1 employee · 4 contractors'
