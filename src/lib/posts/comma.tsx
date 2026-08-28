import { LINKS } from '../content'
import { P, H2, Code, Pre, Quote, A } from './ui'

export function CommaArticle() {
  return (
    <div className="text-18px leading-[1.75] text-body2">
      <P>
        A comma device is a phone-class computer that drives your car. You develop for it the way
        you develop for any embedded box: SSH in, poke around, break things. Except this box is
        velcroed to a windshield, its root filesystem is mounted read-only, and the shell that
        greets you is a bone-stock bash with no history, no completions, and a prompt that tells
        you nothing. Every session started with the same ritual — <Code>cd /data/openpilot</Code>,
        re-type the git incantations, re-discover which tmux pane had the log tail.
      </P>
      <P>
        I got tired of the ritual, so I built{' '}
        <A href="https://github.com/emu-sh/.oh-my-comma">.oh-my-comma</A> — the oh-my-zsh idea
        pointed at <A href="https://github.com/commaai/openpilot">openpilot</A>. Shane Smiskol
        (sshane) came on early and contributed a huge amount of it. The elevator pitch from the
        README: <em>a workbench for developers</em>. Shell utilities, tooling, and dotfiles for
        comma.ai's open-source self-driving stack.
      </P>
      <Quote>
        Improving dev-workflow friction is paramount to innovating openpilot. The device should
        feel like your machine, not a kiosk you're borrowing.
      </Quote>

      <H2>One curl, then you're home</H2>
      <P>Install is a single paste into an SSH session on the device:</P>
      <Pre lang="bash">{`bash <(curl -fsSL install.emu.sh)  # the brain of the bird
source /data/community/.bashrc`}</Pre>
      <P>
        Everything clones into <Code>/data/community/.oh-my-comma</Code> — <Code>/data</Code> is
        the writable partition that survives OS updates. The installer appends one sourcing block
        to the system bashrc, drops a community <Code>.bashrc</Code> you actually own, wires up a{' '}
        <A href="https://github.com/b-ryan/powerline-shell">powerline-shell</A> prompt, and sets
        your login directory to <Code>/data/openpilot</Code>. Much easier to <Code>git pull</Code>{' '}
        right after shelling in. You also get an ASCII emu, because a tool named emu that doesn't
        draw an emu is a missed opportunity.
      </P>
      <P>
        From then on there's an <Code>emu</Code> command, organized like git — a verb, then a
        subcommand:
      </P>
      <Pre lang="bash">{`emu update            # 🎉 update the tool itself
emu uninstall         # 👋 remove it cleanly
emu fork switch       # 🍴 jump between openpilot forks
emu fork list         # 📜 installed forks and branches
emu panda flash       # 🐼 reflash the panda (make recover)
emu panda flash2      # 🎍 flash via the Panda python module
emu debug controlsd   # 🔬 log controlsd to /data/output.log
emu device battery    # 🔋 battery state
emu device reboot     # ⚡ safe reboot
emu device shutdown   # 🔌 safe shutdown
emu device settings   # ⚙  open the Settings app`}</Pre>
      <P>
        The commands you run forty times a day get one-word aliases in <Code>aliases.sh</Code>:{' '}
        <Code>fork</Code> is <Code>emu fork switch</Code>, <Code>pf</Code> is{' '}
        <Code>emu panda flash</Code>, <Code>battery</Code>, <Code>shutdown</Code>,{' '}
        <Code>settings</Code>, <Code>controlsd</Code> all do what they say.
      </P>

      <H2>Bash on the outside, python on the inside</H2>
      <P>
        <Code>emu</Code> itself is a bash function, not a binary. The shell layer exists for the
        things a shell is good at — being sourced into your session, surviving when everything
        else is broken — and immediately hands off to python for the real logic:
      </P>
      <Pre lang="bash">{`function emu() {  # main wrapper function
  if $(python -c '...version...' | grep -q -e '^2'); then
    python3 \${OH_MY_COMMA_PATH}/emu.py "$@"
  else
    python \${OH_MY_COMMA_PATH}/emu.py "$@"
  fi
}`}</Pre>
      <P>
        The version sniff is there because the fleet was mid-migration: NEOS shipped python 2 as{' '}
        <Code>python</Code> long after openpilot itself had moved on. The wrapper probes what{' '}
        <Code>python</Code> actually is and picks <Code>python3</Code> explicitly when it has to.
        Boring code, but it's the difference between "works on my device" and works.
      </P>
      <P>
        On the python side, every command is a class extending <Code>CommandBase</Code>, and every
        subcommand is declared as data — a <Code>Command</Code> with a description and a list of{' '}
        <Code>Flag</Code>s:
      </P>
      <Pre lang="python">{`self.commands = {
  'switch': Command(
    description='🍴 Switch between any openpilot fork',
    flags=[
      Flag('username', "👤 owner of the fork to switch to", dtype='str'),
      Flag(['-b', '--branch'], '🌿 branch, default branch if omitted', dtype='str'),
      Flag(['-r', '--repo'], "repo name if it isn't openpilot", dtype='str'),
      Flag(['-f', '--force'], '💪 like checkout -f, discard changes'),
    ]),
  'list': Command(description='📜 See a list of installed forks and branches',
                  flags=[Flag('fork', '🌿 see branches of specified fork', dtype='str')]),
}`}</Pre>
      <P>
        Dispatch is a dictionary lookup plus <Code>getattr(self, '_' + cmd)</Code> — typing{' '}
        <Code>emu fork switch</Code> calls <Code>Fork._switch()</Code>. The payoff of declaring
        flags as data instead of sprinkling <Code>argparse</Code> everywhere is that help text
        builds itself: run <Code>emu</Code> with no arguments, or an unknown one, and it prints the
        full command tree with usage lines like{' '}
        <Code>emu fork switch (username) [-b BRANCH, -r REPO]</Code>, generated from the same
        objects that do the parsing. Docs can't drift from behavior because they are the behavior.
        One deliberate quirk: <Code>ArgumentParser.error</Code> is overridden to raise instead of{' '}
        <Code>sys.exit</Code>, so a bad flag prints that command's help rather than nuking the
        session.
      </P>

      <H2>Fork switching without the re-clone</H2>
      <P>
        The community half of openpilot lives in forks — someone's fork adds a car port, someone
        else's tunes lateral control, and you want to try both this weekend. The naive workflow is
        a fresh clone per fork, and a full openpilot clone on a device that thinks it's a 2017
        phone is a long lunch.
      </P>
      <P>
        <Code>emu fork</Code> keeps one repository. First run does a one-time clone of{' '}
        <Code>commaai/openpilot</Code>; every fork after that is just another git remote in the
        same repo. Git notices that a fork shares nearly all its blobs with upstream and only
        fetches the delta, so installing a new fork takes seconds-to-minutes instead of
        long-lunch. State — current fork, current branch, everything installed — lives in a small{' '}
        <Code>forks.json</Code> under <Code>/data/community</Code>, so <Code>emu fork list</Code>{' '}
        can show you where you are without touching the network. There are also niceties like
        username aliasing (<Code>stock</Code> means <Code>commaai</Code>) and fuzzy matching via{' '}
        <Code>difflib</Code>, so a typo'd fork name suggests the nearest installed one instead of
        failing cold.
      </P>
      <Pre lang="bash">{`fork sshane            # emu fork switch sshane, default branch
fork commaai -b master # upstream, specific branch
emu fork list          # what's installed, what's current`}</Pre>

      <H2>The filesystem fights back</H2>
      <P>
        The genuinely annoying part of device tooling isn't the tool — it's that the OS is
        immutable and there are two of them. The comma two runs NEOS (Android-descended); the
        comma three runs AGNOS (Ubuntu-based). They disagree about everything the installer
        touches: the system bashrc is <Code>/home/.bashrc</Code> on NEOS but{' '}
        <Code>/etc/bash.bashrc</Code> on AGNOS; the read-only mount is <Code>/system</Code> on one
        and <Code>/</Code> on the other; NEOS lets you write as root while AGNOS wants{' '}
        <Code>sudo</Code>. The installer detects the platform by the marker files comma leaves at
        the root — <Code>/EON</Code> or <Code>/TICI</Code> — and refuses to run anywhere else.
      </P>
      <Pre lang="bash">{`remount_system() {
  if [ -f /EON ]; then
    mount -o "$permission",remount /system || exit 1
  else
    sudo mount -o "$1",remount / || exit 1
  fi
}`}</Pre>
      <P>
        Every write outside <Code>/data</Code> is wrapped in that remount dance: flip to{' '}
        <Code>rw</Code>, append one sourcing block (guarded by a <Code>grep</Code> so reinstalls
        don't stack duplicates), flip back to <Code>ro</Code>. The footprint on the immutable OS
        is deliberately tiny — a few lines in the system bashrc and a symlink for powerline config.
        Everything with actual mass sits in <Code>/data/community</Code>, which is also why an OS
        reflash doesn't eat your setup.
      </P>

      <H2>An updater that can't strand you</H2>
      <P>
        Self-updating tools have a bootstrapping problem: the updater is part of the thing being
        updated, so a bad release can brick its own escape hatch. <Code>emu update</Code> is a
        thin wrapper over <Code>update.sh</Code> — <Code>git pull</Code>, re-run the installer in
        update mode to re-verify the files living outside the repo (bashrc lines, symlinks), then
        print a from/to diff of version, branch, and remote. If the last commit touched the
        default community bashrc, it tells you a newer template exists but refuses to overwrite
        yours — your dotfile, your changes.
      </P>
      <P>The interesting line is in the bash wrapper, not the python:</P>
      <Pre lang="bash">{`if [ $? = 1 ] && [ "$1" = "update" ]; then
  printf "An error occurred in the Python CLI, attempting to manually update...\\n"
  sleep 5  # Ctrl+C to cancel
  _updateohmycomma
fi`}</Pre>
      <P>
        If the python CLI crashes while updating, the shell notices the exit code and falls back
        to sourcing <Code>update.sh</Code> directly, then re-sources <Code>emu.sh</Code> into the
        live session. The recovery path deliberately depends on nothing but bash and git — the two
        things on the device that are never broken. A broken release fixes itself with the next{' '}
        <Code>emu update</Code>, which is exactly the command a stranded user was already going to
        type.
      </P>

      <H2>Should you use it?</H2>
      <P>
        If you SSH into a comma device more than once a month — running a fork, porting a car,
        tuning, or just curious what controlsd is thinking — yes. It's the difference between
        visiting the device and living on it. If you flashed a fork once and only ever update from
        the UI, openpilot's own tools are fine and you don't need any of this.
      </P>
      <P>
        The repo is at{' '}
        <A href="https://github.com/emu-sh/.oh-my-comma">github.com/emu-sh/.oh-my-comma</A> under
        the emu-sh org it grew into, PRs welcome — the README literally asks{' '}
        <em>"what cool shit do you do to your ssh session with your car??"</em>. Other work:{' '}
        <A href={LINKS.github}>{LINKS.github.replace('https://', '')}</A>.
      </P>
    </div>
  )
}
