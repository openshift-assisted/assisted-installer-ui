import axios from 'axios';
import applyCaseMiddleware from 'axios-case-converter';

const client = applyCaseMiddleware(axios.create());

export default client;
