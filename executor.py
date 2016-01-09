#!/usr/bin/python

import translator
import topologyManager
import vagrantExecutor as vagrant
import dockerExecutor as docker
from action import ActionType


import json
import logging

def execute(action):
  if action.type == ActionType.vm_create:
    vagrant.create_vm(action.vm, action.cpu, action.mem)
  elif action.type == ActionType.container_create:
    docker.create_container(action.vm, action.container, action.cpu, action.mem)
  logging.info('Executed {}'.format(action.__str__()))

if __name__ == '__main__':
  logging.basicConfig(level=logging.INFO)
  trans = translator.Translator()
  plan = translator.read_plan('plan.json')  
  actions = trans.translate(plan, topologyManager.get_current())
  string_actions = map(lambda x: x.__str__(), actions)
  print 'plan=', plan
  print 'topology=', topologyManager.get_current()
  # print json.dumps(string_actions, indent=2)
  for action in actions:
    execute(action)
