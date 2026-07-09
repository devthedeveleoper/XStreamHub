import { EventEmitter } from 'events';

// Prevent multiple instances in development
const globalForEventEmitter = global;

const eventEmitter = globalForEventEmitter.eventEmitter || new EventEmitter();

if (process.env.NODE_ENV !== 'production') {
    globalForEventEmitter.eventEmitter = eventEmitter;
}

export default eventEmitter;
