import React from 'react'
import { render } from '@react-email/render'
import { describe, expect, it } from 'vitest'
import { template } from './mensaje-medico'

describe('aviso de mensaje médico', () => {
  it('usa un enlace HTTPS privado y no contiene datos clínicos', async () => {
    const html = await render(React.createElement(template.component, template.previewData))
    expect(html).toContain('https://helthicorp.tech/paciente/resultados')
    expect(html).toContain('el contenido no se incluye en este correo')
    expect(html).not.toContain('hemoglobina')
    expect(html).not.toContain('creatinina')
    expect(template.subject).toBe('Tiene un nuevo mensaje de su médico en HelthIA')
  })
})
