import { TEAM, TEAM_SUMMARY } from '../lib/team'

function EmployeeIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  )
}

function ContractorsIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  )
}

export function Team() {
  const employees = TEAM.filter((m) => m.type === 'employee')
  const contractors = TEAM.filter((m) => m.type === 'contractor')

  return (
    <section id="team" className="section-pad py-[clamp(40px,7vw,90px)] scroll-mt-80px">
      <div className="eyebrow mb-24px">
        <span className="eyebrow-rule" />02 / team
      </div>
      <div className="flex items-baseline gap-16px flex-wrap mb-44px">
        <h2 className="text-[clamp(28px,4vw,46px)] leading-[1.1] font-600 tracking-[-0.02em] mt-0 mb-0">
          emu LLC
        </h2>
        <span className="font-mono text-13px text-mint bg-mint/15 rounded-full px-12px py-5px">
          {TEAM_SUMMARY}
        </span>
      </div>

      <div className="grid gap-14px mb-26px">
        {employees.map((m) => (
          <div
            key={m.name}
            className="grid grid-cols-[auto_1fr] gap-18px items-start border border-white/9 rounded-14px bg-card px-20px py-18px"
          >
            <div
              className="w-46px h-46px rounded-13px flex items-center justify-center shrink-0"
              style={{ background: `${m.color}29`, color: m.color }}
            >
              <EmployeeIcon />
            </div>
            <div>
              <div className="flex items-baseline gap-11px flex-wrap mb-5px">
                <h3 className="text-19px font-600 m-0">{m.name}</h3>
                <span className="text-15px font-500" style={{ color: m.color }}>{m.role}</span>
                <span className="text-11px font-600 text-mint bg-mint/15 rounded-full px-9px py-3px">Employee</span>
              </div>
              <p className="text-muted text-15px leading-[1.6] mt-0 mb-0 max-w-640px">{m.blurb}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-14px grid-cols-[repeat(auto-fill,minmax(260px,1fr))]">
        {contractors.map((m) => (
          <div
            key={m.name}
            className="border border-white/9 rounded-14px bg-card px-18px py-16px"
          >
            <div className="flex items-center gap-11px mb-10px">
              <div
                className="w-36px h-36px rounded-10px flex items-center justify-center shrink-0"
                style={{ background: `${m.color}29`, color: m.color }}
              >
                <ContractorsIcon />
              </div>
              <div>
                <h3 className="text-16px font-600 m-0">{m.name}</h3>
                <span className="text-13px font-500" style={{ color: m.color }}>{m.role}</span>
              </div>
              <span className="text-11px font-600 text-faint bg-white/7 rounded-full px-9px py-3px ml-auto">Contract</span>
            </div>
            <p className="text-muted text-14px leading-[1.55] mt-0 mb-0">{m.blurb}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
