import { Controller, Get, Inject } from "@nestjs/common";
import { ok } from "../common/api-response";
import { KolsService } from "./kols.service";

@Controller("kols")
export class KolsController {
  constructor(@Inject(KolsService) private readonly kolsService: KolsService) {}

  @Get()
  async list() {
    return ok(await this.kolsService.list());
  }
}
