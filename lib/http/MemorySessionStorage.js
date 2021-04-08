const MemorySessionStorage = {

    /**
     * 
     * @param {*} sid 
     * @param {*} s Send s to set or to get
     * @returns 
     */
    session(sid, s) {
        if (sid) {
            if (!s) {
                return this.storage.get(sid);
            } else {
                this.storage.set(sid, s);
            }
        } else {
            throw new Error("Arguments error");
        }
    },

    /**
     * @returns {Map}
     */
    get storage() {
        if (!this._storage) {
            this._storage = new Map();
        }
        return this._storage;
    }

}

module.exports = MemorySessionStorage;