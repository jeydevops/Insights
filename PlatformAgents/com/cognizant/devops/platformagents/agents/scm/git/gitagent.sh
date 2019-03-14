#! /bin/sh
# /etc/init.d/__AGENT_KEY__

### BEGIN INIT INFO
# Provides: Runs a Python script on startup
# Required-Start: BootPython start
# Required-Stop: BootPython stop
# Default-Start: 2 3 4 5
# Default-stop: 0 1 6
# Short-Description: Simple script to run python program at boot
# Description: Runs a python program at boot
### END INIT INFO
#export INSIGHTS_AGENT_HOME=/home/ec2-user/insightsagents
source /etc/profile

case "$1" in
  start)
    if [[ $(ps aux | grep '__AGENT_KEY__' | awk '{print $2}') ]]; then
     echo "__AGENT_KEY__ already running"
    else
     echo "Starting __AGENT_KEY__"
     cd $INSIGHTS_AGENT_HOME/PlatformAgents/git
     python -c "from __AGENT_KEY__.com.cognizant.devops.platformagents.agents.scm.git.GitAgent import GitAgent; GitAgent()" &
    fi
    if [[ $(ps aux | grep '__AGENT_KEY__' | awk '{print $2}') ]]; then
     echo "__AGENT_KEY__ Started Sucessfully"
    else
     echo "__AGENT_KEY__ Failed to Start"
    fi
    ;;
  stop)
    echo "Stopping __AGENT_KEY__"
    if [[ $(ps aux | grep '__AGENT_KEY__' | awk '{print $2}') ]]; then
     sudo kill -9 $(ps aux | grep '__AGENT_KEY__' | awk '{print $2}')
    else
     echo "__AGENT_KEY__ already in stopped state"
    fi
    if [[ $(ps aux | grep '__AGENT_KEY__' | awk '{print $2}') ]]; then
     echo "__AGENT_KEY__ Failed to Stop"
    else
     echo "__AGENT_KEY__ Stopped"
    fi
    ;;
  restart)
    echo "Restarting __AGENT_KEY__"
    if [[ $(ps aux | grep '__AGENT_KEY__' | awk '{print $2}') ]]; then
     echo "__AGENT_KEY__ stopping"
     sudo kill -9 $(ps aux | grep '__AGENT_KEY__' | awk '{print $2}')
     echo "__AGENT_KEY__ stopped"
     echo "__AGENT_KEY__ starting"
     cd $INSIGHTS_AGENT_HOME/PlatformAgents/git
     python -c "from __AGENT_KEY__.com.cognizant.devops.platformagents.agents.scm.git.GitAgent import GitAgent; GitAgent()" &
     echo "__AGENT_KEY__ started"
    else
     echo "__AGENT_KEY__ already in stopped state"
     echo "__AGENT_KEY__ starting"
     cd $INSIGHTS_AGENT_HOME/PlatformAgents/git
     python -c "from __AGENT_KEY__.com.cognizant.devops.platformagents.agents.scm.git.GitAgent import GitAgent; GitAgent()" &
     echo "__AGENT_KEY__ started"
    fi
    ;;
  status)
    echo "Checking the Status of __AGENT_KEY__"
    if [[ $(ps aux | grep '__AGENT_KEY__' | awk '{print $2}') ]]; then
     echo "__AGENT_KEY__ is running"
    else
     echo "__AGENT_KEY__ is stopped"
    fi
    ;;
  *)
    echo "Usage: /etc/init.d/__AGENT_KEY__ {start|stop|restart|status}"
    exit 1
    ;;
esac
exit 0