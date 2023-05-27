import Dexie from 'dexie';
export const db = new Dexie('capp');

// Declare tables, IDs and indexes
db.version(3).stores({
    org: 'id,oid,name',
    project: 'pid,oid,name',
    sprint: 'spid,oid,name,description,firstDay,daysInSprint,teamFlex,pointsRolledOver',
    holiday: 'hid,oid,name,date',
    member: 'mid,oid,name',
    sync:'oid,sync,typ'
});

db.open();
