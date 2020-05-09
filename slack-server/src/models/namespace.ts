type chatHistory = {
  message: string;
  user: string;
}
type roomHistory = {
    roomName: string;
    history: string[] | chatHistory[];
}
class Namespace {
  constructor(
    readonly name: string,
    readonly nsId: string,
    readonly rooms: string[],
    readonly icon: string,
    readonly history: roomHistory[]
    ) {}
}
export default Namespace;