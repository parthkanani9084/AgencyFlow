class LocalStore {
  private store:
    | Storage
    | {
        clear: () => void;
        getItem: (key: string) => string | null;
        setItem: (key: string, val: string) => void;
      };
  private storeKey = 'agencyflow';
  private tempData: Record<string, string> = {};

  constructor() {
    try {
      this.store = (typeof window !== 'undefined' && window.localStorage) || {
        clear: () => {
          this.tempData = {};
        },
        getItem: (key: string) => this.tempData[key] || null,
        setItem: (key: string, val: string) => {
          this.tempData[key] = val;
        },
      };
    } catch {
      this.store = {
        clear: () => {
          this.tempData = {};
        },
        getItem: (key: string) => this.tempData[key] || null,
        setItem: (key: string, val: string) => {
          this.tempData[key] = val;
        },
      };
    }
  }

  _cleanStore() {
    return this.store.clear();
  }

  _getData(): Record<string, any> {
    const data = this.store.getItem(this.storeKey) || '{}';
    return JSON.parse(data);
  }

  _setValToStore(key: string, val: string) {
    const data = this._getData();
    data[key] = val;
    return this.store.setItem(this.storeKey, JSON.stringify(data));
  }

  _getValFromStore(key: string): string | null {
    const data = this._getData();
    return data[key] || null;
  }

  setValue(key: string, val: any) {
    return this._setValToStore(key, JSON.stringify(val));
  }

  getValue(key: string) {
    const val = this._getValFromStore(key);
    return val ? JSON.parse(val) : val;
  }

  removeValue(key: string) {
    const data = this._getData();
    delete data[key];
    return this.store.setItem(this.storeKey, JSON.stringify(data));
  }
}

const store = new LocalStore();
export default store;
