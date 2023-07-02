// Storage Step
Cypress.env('skipFormattingWarningTitle', 'There might be issues with the boot order');
Cypress.env(
  'skipFormattingWarningDesc',
  'You have opted out of formatting bootable disks on some hosts. To ensure the hosts reboot into the expected installation disk, manual user intervention might be required during OpenShift installation.',
);
Cypress.env('warningIconFillColor', '#f0ab00');
