type roomHistory = {
    roomName: string;
    history: string[];
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