"use client"
import { useEffect, useState } from "react"
import { toast } from "sonner"
import { PageHeader } from "@/components/admin/PageHeader"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, Save, TestTube } from "lucide-react"

export default function MultimediaSettingsPage() {
  const [webhookUrl, setWebhookUrl] = useState("")
  const [saving, setSaving] = useState(false)
  const [testing, setTesting] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/settings')
      .then(r => r.json())
      .then(data => {
        const settings = data.data ?? []
        const webhook = settings.find((s: any) => s.key === 'whatsapp_webhook_url')
        if (webhook) setWebhookUrl(webhook.value)
        setLoading(false)
      })
  }, [])

  async function handleSave() {
    setSaving(true)
    try {
      await fetch('/api/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: 'whatsapp_webhook_url', value: webhookUrl })
      })
      toast.success('Pengaturan berhasil disimpan')
    } catch {
      toast.error('Gagal menyimpan pengaturan')
    } finally {
      setSaving(false)
    }
  }

  async function handleTest() {
    setTesting(true)
    try {
      const res = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'TEST',
          message: '✅ Test pesan dari sistem jadwal GPIB Damai Sejahtera. Webhook berhasil terhubung!',
          targets: null,
          metadata: { periodId: 'test', periodName: 'Test' }
        })
      })
      if (res.ok) toast.success('Test berhasil! Webhook aktif.')
      else toast.error('Webhook merespons dengan error')
    } catch {
      toast.error('Gagal menghubungi webhook URL')
    } finally {
      setTesting(false)
    }
  }

  if (loading) return <div className="flex items-center justify-center h-48"><div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full" /></div>

  return (
    <div className="space-y-6">
      <PageHeader title="Pengaturan Multimedia" description="Konfigurasi integrasi dan pengaturan tim multimedia" />

      <Card>
        <CardHeader>
          <CardTitle>Integrasi WhatsApp</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="webhook-url">Webhook URL</Label>
            <p className="text-xs text-muted-foreground">URL endpoint bot WhatsApp yang akan menerima pesan broadcast jadwal</p>
            <div className="flex gap-2">
              <Input
                id="webhook-url"
                value={webhookUrl}
                onChange={e => setWebhookUrl(e.target.value)}
                placeholder="https://your-bot-url.com/webhook"
                className="flex-1"
              />
              <Button variant="outline" onClick={handleTest} disabled={!webhookUrl || testing}>
                {testing ? <Loader2 className="h-4 w-4 animate-spin" /> : <TestTube className="h-4 w-4" />}
                Test
              </Button>
            </div>
          </div>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
            Simpan Pengaturan
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
