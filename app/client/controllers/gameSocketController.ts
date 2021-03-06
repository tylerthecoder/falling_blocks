import { ISocketMessage, ISocketMessageType } from "../../src/types";
import { IAction } from "../../src/types";
import { SocketInterface } from "../app";
import { ClientGame } from "../clientGame";
import { Controller } from "./controller";

export class GameSocketController extends Controller {
  constructor(
    public controlled: ClientGame
  ) {
    super()
    SocketInterface.addListener(this.onMessage.bind(this));
  }

  // maybe perform the actions in here so they aren't async
  update() { /* NO-OP */ }

  onMessage(message: ISocketMessage) {
    switch (message.type) {
      case ISocketMessageType.newPlayer: {
        const payload = message.newPlayerPayload!;
        this.controlled.addPlayer(false, payload.uid);
        break;
      }
      case ISocketMessageType.playerLeave: {
        const payload = message.playerLeavePayload!;
        this.controlled.removeEntity(payload.uid);
        break;
      }
      case ISocketMessageType.actions: {
        const payload = message.actionPayload!;
        payload.forEach((action: IAction) => action.isFromServer = true);
        this.controlled.addActions(payload);
        break;
      }
    }
  }
}
