class LocalStorage {
  static get(key: string) {
    const item = localStorage.getItem(key);

    if (item) {
      try {
        return JSON.parse(item);
      } catch (e) {
        return null;
      }
    }

    return null;
  }

  static set(key: string, value: any): void {
    localStorage.setItem(key, JSON.stringify(value));
  }

  static remove(key: string): boolean {
    if (LocalStorage.get(key) !== undefined) {
      localStorage.removeItem(key);
      return true;
    }

    return false;
  }
}

export default LocalStorage;
