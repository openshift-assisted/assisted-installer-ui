// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
import 'cypress-fill-command';

Cypress.Commands.add('pasteText', (selector, text) => {
  cy.get(selector).then((elem) => {
    elem.text(text);
    elem.val(text);
    cy.get(selector).type(' {backspace}');
  });
});

Cypress.Commands.add('runCmdOnNode', (user, host, cmd) => {
  cy.runCmd(`ssh -o StrictHostKeyChecking=no -i ~/.ssh/id_rsa ${user}@${host} ${cmd}`).its('code').should('eq', 0);
});

Cypress.Commands.add(
  'runCmd',
  (cmd, setAlias = false, failOnNonZeroExit = true, timeout = Cypress.config('defaultCommandTimeout')) => {
    if (Cypress.env('DEV_FLAG')) {
      cmd = `${Cypress.env('sshCmd')} ${cmd}`;
    }
    cy.log(`Executing command: ${cmd}`);
    if (setAlias) {
      cy.exec(`${cmd}`, {
        timeout: timeout,
        failOnNonZeroExit: failOnNonZeroExit,
      }).then((obj) => {
        cy.wrap(obj).as('runCmdAlias');
      });
    } else {
      cy.exec(`${cmd}`, {
        timeout: timeout,
        failOnNonZeroExit: failOnNonZeroExit,
      });
    }
  },
);

Cypress.Commands.add(
  'runCopyCmd',
  (source, dest, failOnNonZeroExit = true, timeout = Cypress.config('defaultCommandTimeout')) => {
    let cmd = '';
    if (Cypress.env('DEV_FLAG')) {
      cmd = `scp ${source} ${Cypress.env('REMOTE_USER')}@${Cypress.env('REMOTE_HOST')}:${dest}`;
    } else {
      cmd = `cp ${source} ${dest}`;
    }
    cy.log(`Executing command: ${cmd}`);
    cy.exec(`${cmd}`, {
      timeout: timeout,
      failOnNonZeroExit: failOnNonZeroExit,
    });
  },
);

Cypress.Commands.add(
  'virshDestroyAllHost',
  (numMasters: number = Cypress.env('NUM_MASTERS'), numWorkers: number = Cypress.env('NUM_WORKERS')) => {
    for (let i = 0; i <= numMasters - 1; i++) {
      cy.runCmd(`virsh destroy master-0-${i}`, false, false);
    }
    for (let i = 0; i <= numWorkers - 1; i++) {
      cy.runCmd(`virsh destroy worker-0-${i}`, false, false);
    }
  },
);

Cypress.Commands.add(
  'virshStartNodes',
  (numMasters: number = Cypress.env('NUM_MASTERS'), numWorkers: number = Cypress.env('NUM_WORKERS')) => {
    for (let i = 0; i <= numMasters - 1; i++) {
      cy.runCmd(`virsh start master-0-${i}`);
    }
    for (let i = 0; i <= numWorkers - 1; i++) {
      cy.runCmd(`virsh start worker-0-${i}`);
    }
  },
);

Cypress.Commands.add('vmWareUploadISO', () => {
  if (Cypress.env('ASSISTED_SNO_DEPLOYMENT') === true) {
    cy.runCmd('scripts/vmware/sno/uploadISO.sh');
  } else {
    cy.runCmd('scripts/vmware/multinode/uploadISO.sh');
  }
});

Cypress.Commands.add('vmWareCreateAndStartNodes', () => {
  if (Cypress.env('ASSISTED_SNO_DEPLOYMENT') === true) {
    cy.runCmd('scripts/vmware/sno/create_master.sh');
  } else {
    cy.runCmd('scripts/vmware/multinode/create_masters.sh');
    cy.runCmd('scripts/vmware/multinode/create_workers.sh');
  }
});

Cypress.Commands.add('cleanStaleFiles', () => {
  cy.runCmd(`rm -rf ${Cypress.env('DISCOVERY_IMAGE_GLOB_PATTERN')}`);
  cy.runCmd(`rm -rf ${Cypress.env('DISCOVERY_IMAGE_PATH')}`);
});

Cypress.Commands.add('runAnsiblePlaybook', (inventory, playbookFile, extraVars, venv) => {
  cy.exec(`sh scripts/run_ansible_playbook.sh ${inventory} ${playbookFile} ${extraVars} ${venv}`);
});

const getImageName = () => {
  return `${Cypress.env('NODE_MANAGEMENT_IMAGE_ROOT')}/discovery_image_${Cypress.env('CLUSTER_NAME')}.iso`;
};

Cypress.Commands.add('deploySingleNodeOnServer', () => {
  const commandParts = [];

  if (Cypress.env('NODE_MANAGEMENT_POOL')) {
    commandParts.push(`STORAGE_POOL=${Cypress.env('NODE_MANAGEMENT_POOL')}`);
  }
  commandParts.push(`${Cypress.env('NODE_MANAGEMENT_HOME')}/host_scripts/setup-env.sh`);
  commandParts.push(`--cluster-name=${Cypress.env('CLUSTER_NAME')} --num-of-nodes=1 --debug`);
  commandParts.push(getImageName());

  cy.runCmd(commandParts.join(' ')).its('code').should('eq', 0);
});

Cypress.Commands.add('cleanUpE2eNodeResources', () => {
  const failOnError = false;

  // Removing the Discover ISO
  cy.runCmd(`rm ${getImageName()}`, false, failOnError);

  // Deleting the VM
  cy.runCmd(`kcli list vm | grep ${Cypress.env('CLUSTER_NAME')} | awk '{printf "%s ",$2}'`).then((result) => {
    const vmName = result.stdout;
    if (vmName !== '') {
      cy.runCmd(`kcli delete vm ${vmName} -y`).its('code').should('eq', 0);
    }
  });
});
