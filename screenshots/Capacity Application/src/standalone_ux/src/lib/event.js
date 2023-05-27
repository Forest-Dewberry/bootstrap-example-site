//event.js

class Event{
    constructor(){
        this.events = {};
    }

    on(eventName, typ, fn) {
        console.log("event register", eventName);
        this.events[eventName] = this.events[eventName] || {};
        this.events[eventName][typ]=fn;
    }
    emit = (eventName, data)=> {
        console.log("emit register", eventName);
        let events=this.events[eventName];
        if(!events) return;
        for (let [key, func] of Object.entries(events)) {
          console.log("calling", eventName, key);
          func(data);
        }
    };
}

export default new Event();
