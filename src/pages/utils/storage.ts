// 存储对象到 localStorage
export function setLocal(key: string, value: any): void {
    const jsonValue = JSON.stringify(value);
    localStorage.setItem(key, jsonValue);
  }
  
  // 从 localStorage 获取对象
  export function getLocal<T>(key: string): T | null {
    const jsonValue = localStorage.getItem(key);
    if (jsonValue) {
      return JSON.parse(jsonValue) as T;
    }
    return null;
  }
  
  // 从 localStorage 删除对象
  export function removeLocal(key: string): void {
    localStorage.removeItem(key);
  }
  
  // 清空 localStorage
  export function clearLocal(): void {
    localStorage.clear();
  }
  
  // 示例用法
//   const user = { name: 'Alice', age: 25 };
  
//   // 存储对象
//   setItem('user', user);
  
//   // 获取对象
//   const storedUser = getItem<{ name: string; age: number }>('user');
//   console.log(storedUser); // 输出: { name: 'Alice', age: 25 }
  
//   // 删除对象
//   removeItem('user');
  
//   // 清空 localStorage
//   clear();