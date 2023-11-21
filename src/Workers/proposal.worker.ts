
const { parentPort } = require('worker_threads');

parentPort.on('message', (message) => {
    console.log('message', message);
    if (message === 'PROPOSAL_CREATED') {
        console.log(`Proposal created ${message.value} message from worker`);
    }
    if (message === 'PROPOSAL_UPDATED') {
        console.log('Proposal updated message from worker');
    }
    if (message === 'USER_VOTED') {
        console.log('User voted message from worker');
    }
});
