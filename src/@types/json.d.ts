type JsonReviver = (this: any, key: string, value: any) => any;

interface JSON {
  parse<T>(text: string, reviver?: JsonReviver): T;
}
