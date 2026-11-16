import { BadRequestException, Body, Controller, Get, HttpCode, Param, Post } from '@nestjs/common';
import { InventoryService } from './inventory.service';

@Controller()
export class InventoryController {
  constructor(private readonly inventory: InventoryService) {}

  @Get('health')
  health() { return { status: 'ok' }; }

  @Get('inventory')
  snapshot() { return this.inventory.snapshot(); }

  @Get('products')
  products() { return this.inventory.snapshot().products; }

  @Get('products/:id/stock')
  stock(@Param('id') id: string) {
    return { productId: id, availableStock: this.inventory.getAvailableStock(id) };
  }

  @Get('reservations')
  reservations() { return this.inventory.snapshot().reservations; }

  @Post('reservations')
  reserve(@Body() body: unknown) {
    if (!body || typeof body !== 'object' || Array.isArray(body)) {
      throw new BadRequestException('Expected a JSON object.');
    }
    const input = body as Record<string, unknown>;
    if (typeof input.productId !== 'string' || !input.productId.trim() || typeof input.quantity !== 'number') {
      throw new BadRequestException('Provide a productId string and a numeric quantity.');
    }
    if (Object.keys(input).some((key) => key !== 'productId' && key !== 'quantity')) {
      throw new BadRequestException('Only productId and quantity are accepted.');
    }
    return this.inventory.reserveStock(input.productId, input.quantity);
  }

  @Post('reservations/:id/confirm')
  @HttpCode(200)
  confirm(@Param('id') id: string) { return this.inventory.confirmReservation(id); }

  @Post('reservations/:id/cancel')
  @HttpCode(200)
  cancel(@Param('id') id: string) { return this.inventory.cancelReservation(id); }
}
