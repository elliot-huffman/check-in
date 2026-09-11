import type { CheckIn, CheckOut } from '../../Utility/types/AccessControl.js';
import type { LegalForm, LegalFormDraft, LegalFormSignature, LegalFormSignatureDraft, LegalFormVersion, LegalFormVersionDraft } from '../../Utility/types/Legal.js';
import type { Member } from '../../Utility/types/Member.js';
// eslint-disable-next-line @typescript-eslint/no-require-imports
import electronApi = require('electron');

electronApi.contextBridge.exposeInMainWorld('electronApi', {
	'AccessControlEngine': {
		'checkIn': async (memberId: Member['id'], reason: CheckIn['activity'], actor?: CheckIn['initiatingActor']) => await electronApi.ipcRenderer.invoke('AccessControlEngine.checkIn', memberId, reason, actor),
		'checkOut': async (memberId: Member['id'], actor?: CheckOut['initiatingActor']) => await electronApi.ipcRenderer.invoke('AccessControlEngine.checkOut', memberId, actor)
	},
	'MemberEngine': {
		'newMember': async (memberDraft: Member | Omit<Member, 'id'>) => await electronApi.ipcRenderer.invoke('MemberEngine.newMember', memberDraft),
		'getMember': async (id?: Member['id'], filter?: Partial<Member>) => await electronApi.ipcRenderer.invoke('MemberEngine.getMember', id, filter),
		'removeMember': async (id: Member['id']) => await electronApi.ipcRenderer.invoke('MemberEngine.removeMember', id)
	},
	'LegalEngine': {
		'newForm': async (formDraft: LegalFormDraft, formId?: LegalForm['id']) => await electronApi.ipcRenderer.invoke('LegalEngine.newForm', formDraft, formId),
		'newFormVersion': async (formId: LegalForm['id'], formVersionDraft: LegalFormVersionDraft) => await electronApi.ipcRenderer.invoke('LegalEngine.newFormVersion', formId, formVersionDraft),
		'updateFormVersion': async (id: LegalFormVersion['id'], formVersionDraft: LegalFormVersionDraft) => await electronApi.ipcRenderer.invoke('LegalEngine.updateFormVersion', id, formVersionDraft),
		'getForm': async (id?: LegalForm['id']) => await electronApi.ipcRenderer.invoke('LegalEngine.getForm', id),
		'getFormVersion': async (id?: LegalFormVersion['id']) => await electronApi.ipcRenderer.invoke('LegalEngine.getFormVersion', id),
		'removeFormVersion': async (id: LegalFormVersion['id']) => await electronApi.ipcRenderer.invoke('LegalEngine.removeFormVersion', id),
		'removeForm': async (id: LegalForm['id']) => await electronApi.ipcRenderer.invoke('LegalEngine.removeForm', id),
		'newSignature': async (signatureCapture: LegalFormSignatureDraft) => await electronApi.ipcRenderer.invoke('LegalEngine.newSignature', signatureCapture),
		'getSignature': async (id?: LegalFormSignature['id']) => await electronApi.ipcRenderer.invoke('LegalEngine.getSignature', id)
	}
});
