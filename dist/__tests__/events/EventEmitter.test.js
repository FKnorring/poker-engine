"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const EventEmitter_1 = require("../../events/EventEmitter");
describe("EventEmitter", () => {
    let emitter;
    beforeEach(() => {
        emitter = new EventEmitter_1.EventEmitter();
    });
    test("should subscribe and emit events", () => {
        const handler = jest.fn();
        emitter.on("test", handler);
        emitter.emit("test", { foo: "bar" });
        expect(handler).toHaveBeenCalledTimes(1);
        expect(handler).toHaveBeenCalledWith({ foo: "bar" });
    });
    test("should unsubscribe from events", () => {
        const handler = jest.fn();
        const unsubscribe = emitter.on("test", handler);
        emitter.emit("test", "data");
        expect(handler).toHaveBeenCalledTimes(1);
        unsubscribe();
        emitter.emit("test", "more data");
        expect(handler).toHaveBeenCalledTimes(1); // Still only called once
    });
    test("should handle 'once' subscriptions correctly", () => {
        const handler = jest.fn();
        emitter.once("test", handler);
        emitter.emit("test", "first time");
        expect(handler).toHaveBeenCalledTimes(1);
        emitter.emit("test", "second time");
        expect(handler).toHaveBeenCalledTimes(1); // Not called again
    });
    test("should handle multiple handlers for the same event", () => {
        const handler1 = jest.fn();
        const handler2 = jest.fn();
        emitter.on("test", handler1);
        emitter.on("test", handler2);
        emitter.emit("test", "data");
        expect(handler1).toHaveBeenCalledTimes(1);
        expect(handler2).toHaveBeenCalledTimes(1);
    });
    test("should not call handlers for different events", () => {
        const handler1 = jest.fn();
        const handler2 = jest.fn();
        emitter.on("test1", handler1);
        emitter.on("test2", handler2);
        emitter.emit("test1", "data");
        expect(handler1).toHaveBeenCalledTimes(1);
        expect(handler2).toHaveBeenCalledTimes(0);
    });
    test("should remove all listeners for an event", () => {
        const handler1 = jest.fn();
        const handler2 = jest.fn();
        emitter.on("test", handler1);
        emitter.on("test", handler2);
        emitter.removeAllListeners("test");
        emitter.emit("test", "data");
        expect(handler1).toHaveBeenCalledTimes(0);
        expect(handler2).toHaveBeenCalledTimes(0);
    });
    test("should remove all listeners for all events", () => {
        const handler1 = jest.fn();
        const handler2 = jest.fn();
        emitter.on("test1", handler1);
        emitter.on("test2", handler2);
        emitter.removeAllListeners();
        emitter.emit("test1", "data");
        emitter.emit("test2", "data");
        expect(handler1).toHaveBeenCalledTimes(0);
        expect(handler2).toHaveBeenCalledTimes(0);
    });
    test("should count listeners correctly", () => {
        const handler1 = jest.fn();
        const handler2 = jest.fn();
        expect(emitter.listenerCount("test")).toBe(0);
        emitter.on("test", handler1);
        expect(emitter.listenerCount("test")).toBe(1);
        emitter.on("test", handler2);
        expect(emitter.listenerCount("test")).toBe(2);
        emitter.off("test", handler1);
        expect(emitter.listenerCount("test")).toBe(1);
        emitter.removeAllListeners("test");
        expect(emitter.listenerCount("test")).toBe(0);
    });
    test("should handle errors in event handlers", () => {
        // Mock console.error to prevent it from cluttering the test output
        const originalConsoleError = console.error;
        console.error = jest.fn();
        const goodHandler = jest.fn();
        const badHandler = jest.fn().mockImplementation(() => {
            throw new Error("Oops");
        });
        emitter.on("test", badHandler);
        emitter.on("test", goodHandler);
        // This should not throw despite the error in badHandler
        emitter.emit("test", "data");
        expect(badHandler).toHaveBeenCalledTimes(1);
        expect(goodHandler).toHaveBeenCalledTimes(1);
        expect(console.error).toHaveBeenCalled();
        // Restore console.error
        console.error = originalConsoleError;
    });
});
//# sourceMappingURL=EventEmitter.test.js.map