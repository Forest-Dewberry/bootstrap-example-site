import json

my_entity = {
    u'Some': 'RedMarker',
    u'Stock': 15,
    u'Bob': 2,
    u'Price': 9.99,
    u'Comments': u"great product",
    u'OnSale': True,
    u'ReducedPrice': 7.99
}

my_entity2 = {
    u'Some': 'RedMarker12',
    u'Stock': None,
    u'Price': 9.99,
    u'Comments': u"great product",
    u'OnSale': True,
    u'ReducedPrice': 7.99
}

def changes(f,t):
    if f!=None and t!=None:
        shared_items = {k: f[k] for k in f if k in t and f[k] == t[k]}
        
        items = [k for k in f if k in t and f[k] != t[k]]
        
        for k in f:
            if k not in t:
                items.append(k)

        for k in t:
            if k not in f:
                items.append(k)
            
        changes = []
        for k in items:
            changes.append({"Field":k,"From":f.get(k,'Null'),"To":t.get(k,'Null')})

        return {
            "Changes":changes,
            "Was":f,
            "Now":t
        }

    if f!=None and t==None:
        changes = []
        for k in f:
            changes.append({"Field":k,"From":f.get(k,'Null'),"To":None})

        return {
            "Changes":changes,
            "Was":f,
            "Now":t
        }
    
    if f==None and t!=None:
        changes = []
        for k in t:
            changes.append({"Field":k,"From":t.get(k,'Null'),"To":None})

        return {
            "Changes":changes,
            "Was":f,
            "Now":t
        }

    return {
            "Changes":[],
            "Was":f,
            "Now":t
        }

print(changes(my_entity,my_entity2))
print(changes(my_entity,None))
print(changes(None,my_entity2))
print(changes(None,None))

