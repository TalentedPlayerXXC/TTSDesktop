import { useState, useCallback } from 'react'
import presets, { type Preset } from './presets'
import effectsList from './effects'

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface ActiveEffect {
  def: any
  values: Record<string, number>
}

/* ------------------------------------------------------------------ */
/*  Hook                                                               */
/* ------------------------------------------------------------------ */

export function usePresets(
  activeEffects: ActiveEffect[],
  setActiveEffects: (effects: ActiveEffect[] | ((prev: ActiveEffect[]) => ActiveEffect[])) => void,
) {
  const [activePreset, setActivePreset] = useState<string | null>(null)

  const applyPreset = useCallback(
    (preset: Preset) => {
      const newEffects: ActiveEffect[] = []
      for (const e of preset.effects) {
        const def = effectsList.find(d => d.id === e.effectId)
        if (def) {
          const values: Record<string, number> = {}
          def.params.forEach(p => {
            values[p.key] = p.default
          })
          Object.assign(values, e.values)
          newEffects.push({ def, values })
        }
      }
      setActiveEffects(newEffects)
      setActivePreset(preset.id)
    },
    [setActiveEffects],
  )

  const clearPreset = useCallback(() => {
    setActiveEffects([])
    setActivePreset(null)
  }, [setActiveEffects])

  const handlePresetClick = useCallback(
    (preset: Preset) => {
      if (activePreset === preset.id) {
        clearPreset()
      } else {
        applyPreset(preset)
      }
    },
    [activePreset, applyPreset, clearPreset],
  )

  const resetPreset = useCallback(() => {
    setActivePreset(null)
  }, [])

  return {
    activePreset,
    handlePresetClick,
    resetPreset,
    clearPreset,
  }
}
