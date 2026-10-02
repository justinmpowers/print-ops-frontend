import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CreatedDeviceKey, DeviceKey, DeviceService } from 'services/device.service';
import { IconComponent } from 'components/icon/icon.component';

/** Manage API keys for unattended devices (e.g. a PrintHub board) that report to this shop. */
@Component({
  selector: 'app-devices-panel',
  standalone: true,
  imports: [CommonModule, FormsModule, IconComponent],
  templateUrl: './devices-panel.component.html',
  styleUrls: ['./devices-panel.component.scss'],
})
export class DevicesPanelComponent implements OnInit {
  devices = signal<DeviceKey[]>([]);
  loading = signal(true);
  error = signal('');
  creating = signal(false);
  created = signal<CreatedDeviceKey | null>(null);   // shown once, right after creation
  copied = signal(false);
  newName = '';

  constructor(private deviceService: DeviceService) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.deviceService.list().subscribe({
      next: res => {
        this.devices.set(res.devices);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Could not load devices.');
        this.loading.set(false);
      },
    });
  }

  create(): void {
    const name = this.newName.trim();
    if (!name || this.creating()) return;
    this.creating.set(true);
    this.error.set('');
    this.deviceService.create(name).subscribe({
      next: device => {
        this.created.set(device);
        this.copied.set(false);
        this.newName = '';
        this.creating.set(false);
        this.load();
      },
      error: () => {
        this.error.set('Could not create the device key.');
        this.creating.set(false);
      },
    });
  }

  copyKey(): void {
    const key = this.created()?.key;
    if (!key) return;
    navigator.clipboard?.writeText(key).then(() => this.copied.set(true), () => this.copied.set(false));
  }

  dismissCreated(): void {
    this.created.set(null);
  }

  /** The API returns UTC timestamps without a zone suffix; mark them as UTC so they display in local time. */
  utc(timestamp: string | null): string | null {
    if (!timestamp) return null;
    return /(Z|[+-]\d\d:\d\d)$/.test(timestamp) ? timestamp : `${timestamp}Z`;
  }

  revoke(device: DeviceKey): void {
    if (!confirm(`Revoke "${device.name}"? The device will stop being able to report until you give it a new key.`)) return;
    this.deviceService.revoke(device.id).subscribe({
      next: () => {
        if (this.created()?.id === device.id) this.created.set(null);
        this.load();
      },
      error: () => this.error.set('Could not revoke the device key.'),
    });
  }
}
