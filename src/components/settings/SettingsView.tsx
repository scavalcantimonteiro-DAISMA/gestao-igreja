import React, { useState } from 'react';
import { Settings, Building2, MessageSquare, History, Save, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { Church, MessageTemplate } from '../../types';
import { useChurch } from '../../context/ChurchContext';
import { useNotification } from '../../context/NotificationContext';
import { getMessageTemplates, saveMessageTemplate, getAuditLogs, logAction } from '../../services/storage';

export const SettingsView: React.FC = () => {
  const { currentChurch, updateCurrentChurch } = useChurch();
  const { showToast } = useNotification();

  const [activeSubTab, setActiveSubTab] = useState<'igreja' | 'mensagens' | 'auditoria'>('igreja');

  // Form Igreja sincronizado dinamicamente com currentChurch
  const [churchForm, setChurchForm] = useState<Partial<Church>>({
    name: currentChurch.name,
    address: currentChurch.address,
    city: currentChurch.city,
    state: currentChurch.state,
    instagram: currentChurch.instagram,
    phone: currentChurch.phone,
    whatsapp: currentChurch.whatsapp,
    pastorName: currentChurch.pastorName,
    pastorPhone: currentChurch.pastorPhone,
    pastorWhatsapp: currentChurch.pastorWhatsapp,
    pastoralOfficeWhatsapp: currentChurch.pastoralOfficeWhatsapp,
    secretaryWhatsapp: currentChurch.secretaryWhatsapp,
    defaultBirthdaySender: currentChurch.defaultBirthdaySender || 'pastor',
    defaultGeneralSender: currentChurch.defaultGeneralSender || 'secretaria',
    dailyReportHour: currentChurch.dailyReportHour
  });

  // Atualiza os campos do formulário sempre que a congregação mudar ou sincronizar em tempo real da nuvem
  React.useEffect(() => {
    setChurchForm({
      name: currentChurch.name,
      address: currentChurch.address,
      city: currentChurch.city,
      state: currentChurch.state,
      instagram: currentChurch.instagram,
      phone: currentChurch.phone,
      whatsapp: currentChurch.whatsapp,
      pastorName: currentChurch.pastorName,
      pastorPhone: currentChurch.pastorPhone,
      pastorWhatsapp: currentChurch.pastorWhatsapp,
      pastoralOfficeWhatsapp: currentChurch.pastoralOfficeWhatsapp,
      secretaryWhatsapp: currentChurch.secretaryWhatsapp,
      defaultBirthdaySender: currentChurch.defaultBirthdaySender || 'pastor',
      defaultGeneralSender: currentChurch.defaultGeneralSender || 'secretaria',
      dailyReportHour: currentChurch.dailyReportHour
    });
  }, [currentChurch]);

  // Mensagens
  const [templates, setTemplates] = useState<MessageTemplate[]>(() => getMessageTemplates(currentChurch.id));
  const logs = getAuditLogs(currentChurch.id);

  const handleSaveChurch = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateCurrentChurch(churchForm);
    logAction(currentChurch.id, 'Administrador', 'ADMIN', 'Atualização de Dados e Canais de WhatsApp da Igreja', currentChurch.name);
    showToast('Configurações salvas e sincronizadas com a nuvem!', 'success');
  };

  const handleUpdateTemplate = (id: string, newText: string) => {
    const tpl = templates.find(t => t.id === id);
    if (!tpl) return;

    const updated: MessageTemplate = {
      ...tpl,
      text: newText
    };

    saveMessageTemplate(updated);
    setTemplates(getMessageTemplates(currentChurch.id));
    showToast(`Modelo "${tpl.title}" atualizado com sucesso!`, 'success');
  };

  return (
    <div className="space-y-6 animate-in fade-in">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-3">
            <Settings className="w-6 h-6 text-sky-600" />
            <span>Configurações & Parâmetros</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            {currentChurch.name} • Identidade, templates de mensagens e histórico de auditoria
          </p>
        </div>

        <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-slate-100 border border-slate-200">
          <button
            onClick={() => setActiveSubTab('igreja')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeSubTab === 'igreja' ? 'bg-white text-sky-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Dados da Igreja
          </button>
          <button
            onClick={() => setActiveSubTab('mensagens')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeSubTab === 'mensagens' ? 'bg-white text-sky-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Modelos de Mensagens
          </button>
          <button
            onClick={() => setActiveSubTab('auditoria')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeSubTab === 'auditoria' ? 'bg-white text-sky-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Log de Alterações ({logs.length})
          </button>
        </div>
      </div>

      {/* SUB-ABA 1: DADOS DA IGREJA */}
      {activeSubTab === 'igreja' && (
        <form onSubmit={handleSaveChurch} className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-sm space-y-4 max-w-2xl">
          <h3 className="text-base font-bold text-slate-900 mb-2 flex items-center gap-2">
            <Building2 className="w-5 h-5 text-sky-600" /> Informações Cadastrais da Congregação
          </h3>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Nome da Igreja</label>
            <input
              type="text"
              value={churchForm.name || ''}
              onChange={e => setChurchForm({ ...churchForm, name: e.target.value })}
              className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm outline-none focus:bg-white focus:border-sky-500 transition-colors"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Endereço Completo</label>
              <input
                type="text"
                value={churchForm.address || ''}
                onChange={e => setChurchForm({ ...churchForm, address: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm outline-none focus:bg-white focus:border-sky-500 transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Cidade / Estado</label>
              <input
                type="text"
                value={`${churchForm.city || 'Maceió'} - ${churchForm.state || 'AL'}`}
                onChange={e => {
                  const [c, s] = e.target.value.split('-');
                  setChurchForm({ ...churchForm, city: c?.trim(), state: s?.trim() });
                }}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm outline-none focus:bg-white focus:border-sky-500 transition-colors"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Instagram</label>
              <input
                type="text"
                placeholder="@igreja"
                value={churchForm.instagram || ''}
                onChange={e => setChurchForm({ ...churchForm, instagram: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm outline-none focus:bg-white focus:border-sky-500 transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Telefone Fixo / Recepção</label>
              <input
                type="text"
                placeholder="Ex: (81) 3325-0000"
                value={churchForm.phone || ''}
                onChange={e => setChurchForm({ ...churchForm, phone: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm outline-none focus:bg-white focus:border-sky-500 transition-colors"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 space-y-4">
            <div>
              <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-emerald-600" />
                Canais de WhatsApp para Disparo de Mensagens
              </h4>
              <p className="text-xs text-slate-500 mt-0.5">
                Defina os números oficiais de WhatsApp que serão utilizados pelos módulos do sistema.
              </p>
            </div>

            {/* Canal 1: Pastor Titular */}
            <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200/80 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-900 uppercase tracking-wider flex items-center gap-1.5">
                  <span>👑 Pastor Titular</span>
                </span>
                <span className="text-[10px] bg-amber-200/70 text-amber-900 font-semibold px-2 py-0.5 rounded-full">
                  Aniversários & Relatório Diário
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Nome do Pastor</label>
                  <input
                    type="text"
                    placeholder="Ex: Pr. João Silva"
                    value={churchForm.pastorName || ''}
                    onChange={e => setChurchForm({ ...churchForm, pastorName: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-white border border-amber-200 text-slate-900 text-xs sm:text-sm outline-none focus:border-amber-500 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">WhatsApp do Pastor (com DDD)</label>
                  <input
                    type="text"
                    placeholder="Ex: (81) 98888-7777 ou 5581988887777"
                    value={churchForm.pastorWhatsapp || ''}
                    onChange={e => setChurchForm({ ...churchForm, pastorWhatsapp: e.target.value, pastorPhone: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-white border border-amber-200 text-slate-900 text-xs sm:text-sm outline-none focus:border-amber-500 transition-colors"
                  />
                </div>
              </div>
            </div>

            {/* Canal 2: Gabinete Pastoral */}
            <div className="p-4 rounded-2xl bg-sky-50/60 border border-sky-200/80 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-sky-900 uppercase tracking-wider flex items-center gap-1.5">
                  <span>🏛️ Gabinete Pastoral</span>
                </span>
                <span className="text-[10px] bg-sky-200/70 text-sky-900 font-semibold px-2 py-0.5 rounded-full">
                  Atendimentos & Aniversários
                </span>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">WhatsApp do Gabinete Pastoral (com DDD)</label>
                <input
                  type="text"
                  placeholder="Ex: (81) 99999-8888 ou 5581999998888"
                  value={churchForm.pastoralOfficeWhatsapp || ''}
                  onChange={e => setChurchForm({ ...churchForm, pastoralOfficeWhatsapp: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-white border border-sky-200 text-slate-900 text-xs sm:text-sm outline-none focus:border-sky-500 transition-colors"
                />
              </div>
            </div>

            {/* Canal 3: Secretaria da Igreja */}
            <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200/80 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-900 uppercase tracking-wider flex items-center gap-1.5">
                  <span>📋 Secretaria da Igreja</span>
                </span>
                <span className="text-[10px] bg-emerald-200/70 text-emerald-900 font-semibold px-2 py-0.5 rounded-full">
                  Visitantes & Mensagens Gerais
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">WhatsApp da Secretaria (com DDD)</label>
                  <input
                    type="text"
                    placeholder="Ex: (81) 97777-6666 ou 5581977776666"
                    value={churchForm.secretaryWhatsapp || churchForm.whatsapp || ''}
                    onChange={e => setChurchForm({ ...churchForm, secretaryWhatsapp: e.target.value, whatsapp: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-white border border-emerald-200 text-slate-900 text-xs sm:text-sm outline-none focus:border-emerald-500 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Telefone Fixo / Recepção</label>
                  <input
                    type="text"
                    placeholder="Ex: (81) 3325-0000"
                    value={churchForm.phone || ''}
                    onChange={e => setChurchForm({ ...churchForm, phone: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-white border border-emerald-200 text-slate-900 text-xs sm:text-sm outline-none focus:border-emerald-500 transition-colors"
                  />
                </div>
              </div>
            </div>

            {/* Regras e Preferências de Disparo */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
              <h5 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Preferências de Remetente Padrão
              </h5>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Aniversários (Casamento & Idade):
                  </label>
                  <select
                    value={churchForm.defaultBirthdaySender || 'pastor'}
                    onChange={e => setChurchForm({ ...churchForm, defaultBirthdaySender: e.target.value as 'pastor' | 'gabinete' })}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-800 font-medium outline-none focus:border-sky-500"
                  >
                    <option value="pastor">Pastor Titular (Mensagem Pastoral)</option>
                    <option value="gabinete">Gabinete Pastoral</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Demais Mensagens (Visitantes & Avisos):
                  </label>
                  <select
                    value={churchForm.defaultGeneralSender || 'secretaria'}
                    onChange={e => setChurchForm({ ...churchForm, defaultGeneralSender: e.target.value as 'secretaria' | 'pastor' | 'gabinete' })}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-800 font-medium outline-none focus:border-sky-500"
                  >
                    <option value="secretaria">Secretaria da Igreja</option>
                    <option value="pastor">Pastor Titular</option>
                    <option value="gabinete">Gabinete Pastoral</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Horário do Relatório Diário */}
            <div className="pt-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">Horário do Relatório Diário do Pastor</label>
              <input
                type="time"
                value={churchForm.dailyReportHour || '07:30'}
                onChange={e => setChurchForm({ ...churchForm, dailyReportHour: e.target.value })}
                className="w-full sm:w-48 px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm outline-none focus:bg-white focus:border-sky-500 transition-colors"
              />
            </div>
          </div>

          <div className="pt-4 flex justify-end">
            <button
              type="submit"
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 text-white text-xs font-bold shadow-lg shadow-sky-500/20 transition-all active:scale-95"
            >
              <Save className="w-4 h-4" />
              Salvar Alterações
            </button>
          </div>
        </form>
      )}

      {/* SUB-ABA 2: MODELOS DE MENSAGENS (Item 42) */}
      {activeSubTab === 'mensagens' && (
        <div className="space-y-4 max-w-3xl">
          <div className="p-4 rounded-2xl bg-sky-50 border border-sky-200 text-xs text-sky-800">
            <span className="font-bold">Variáveis dinâmicas suportadas:</span> {'{nome}'}, {'{idade}'}, {'{esposo}'}, {'{esposa}'}, {'{anos_casamento}'}, {'{igreja}'}.
          </div>

          <div className="space-y-4">
            {templates.map(tpl => (
              <div
                key={tpl.id}
                className="p-5 rounded-3xl bg-white border border-slate-200/90 shadow-sm space-y-2"
              >
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <h4 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-sky-600" />
                    {tpl.title}
                  </h4>
                  <span className="text-[10px] text-slate-400 font-mono">ID: {tpl.type}</span>
                </div>

                <textarea
                  rows={3}
                  defaultValue={tpl.text}
                  id={`tpl_text_${tpl.id}`}
                  className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 outline-none focus:bg-white focus:border-sky-500 leading-relaxed font-sans transition-colors"
                />

                <div className="flex justify-end pt-1">
                  <button
                    onClick={() => {
                      const el = document.getElementById(`tpl_text_${tpl.id}`) as HTMLTextAreaElement;
                      if (el) handleUpdateTemplate(tpl.id, el.value);
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-sky-700 text-xs font-semibold transition-colors"
                  >
                    <Save className="w-3.5 h-3.5" />
                    Salvar Modelo
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUB-ABA 3: LOG DE ALTERAÇÕES / AUDITORIA (Item 39) */}
      {activeSubTab === 'auditoria' && (
        <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-sm">
          <h3 className="font-bold text-base text-slate-900 mb-4 flex items-center gap-2">
            <History className="w-5 h-5 text-sky-600" />
            Histórico Administrativo de Alterações
          </h3>

          <div className="space-y-2.5">
            {logs.map(log => (
              <div
                key={log.id}
                className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-start justify-between gap-4 text-xs"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900">{log.userName}</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-sky-100 text-sky-800 font-semibold">
                      {log.userRole}
                    </span>
                    <span className="text-slate-500">• {log.action}</span>
                  </div>
                  <p className="text-slate-600 mt-1">{log.details}</p>
                </div>
                <span className="text-[10px] text-slate-400 shrink-0 font-mono">
                  {new Date(log.timestamp).toLocaleString('pt-BR')}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
