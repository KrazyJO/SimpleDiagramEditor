/**
 * A clip board stub
 */
export default class Clipboard {

  private _data : any;

  public get() {
    return this._data;
  };
  
  public set(data : any) {
    this._data = data;
  };
  
  public clear() {
    var data = this._data;
  
    delete this._data;
  
    return data;
  };
  
  public isEmpty() {
    return !this._data;
  };
}
