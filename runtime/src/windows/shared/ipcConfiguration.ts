import type { CheckIn, CheckOut } from '../../Utility/types/AccessControl.js';
import type { LegalForm, LegalFormDraft, LegalFormSignature, LegalFormSignatureDraft, LegalFormVersion, LegalFormVersionDraft } from '../../Utility/types/Legal.js';
import { AccessControlEngine } from '../../core/AccessControl.js';
import { LegalEngine } from '../../core/Legal.js';
import type { Member } from '../../Utility/types/Member.js';
import { MemberEngine } from '../../core/Member.js';
import { ipcMain } from 'electron';

/** Instance of the access control engine, used to expose business logic to the renderer process. */
const accessControlEngine = await AccessControlEngine.getInstance();

/** Instance of the member engine, used to expose business logic to the renderer process. */
const memberEngine = await MemberEngine.getInstance();

/** Instance of the legal engine, used to expose business logic to the renderer process. */
const legalEngine = await LegalEngine.getInstance();

/** Initializes the one-way async IPC handlers exposed to the renderer process. */
export function initializeIpc(): void {
    // #region Access Control Engine
    ipcMain.handle('AccessControlEngine.checkIn', async (_event, memberId: Member['id'], reason: CheckIn['activity'], actor?: CheckIn['initiatingActor']) => accessControlEngine.checkIn(memberId, reason, actor));

    ipcMain.handle('AccessControlEngine.checkOut', async (_event, memberId: Member['id'], actor?: CheckOut['initiatingActor']) => accessControlEngine.checkOut(memberId, actor));

    // #endregion Access Control Engine

    // #region Member Engine

    ipcMain.handle('MemberEngine.newMember', async (_event, memberDraft: Member | Omit<Member, 'id'>) => await memberEngine.newMember(memberDraft));

    ipcMain.handle('MemberEngine.getMember', async (_event, id?: Member['id'], filter?: Partial<Member>) => {
        if (typeof id === 'undefined') { return memberEngine.getMember(void 0 as never, filter); }

        return memberEngine.getMember(id);
    });

    ipcMain.handle('MemberEngine.removeMember', async (_event, id: Member['id']) => { await memberEngine.removeMember(id); });

    // #endregion Member Engine

    // #region Legal Engine

    ipcMain.handle('LegalEngine.newForm', async (_event, formDraft: LegalFormDraft, formId?: LegalForm['id']) => legalEngine.newForm(formDraft, formId));

    ipcMain.handle('LegalEngine.newFormVersion', async (_event, formId: LegalForm['id'], formVersionDraft: LegalFormVersionDraft) => legalEngine.newFormVersion(formId, formVersionDraft));

    ipcMain.handle('LegalEngine.updateFormVersion', async (_event, id: LegalFormVersion['id'], formVersionDraft: LegalFormVersionDraft) => legalEngine.updateFormVersion(id, formVersionDraft));

    ipcMain.handle('LegalEngine.getForm', async (_event, id?: LegalForm['id']) => {
        if (typeof id === 'undefined') { return legalEngine.getForm(); }

        return legalEngine.getForm(id);
    });

    ipcMain.handle('LegalEngine.getFormVersion', async (_event, id?: LegalFormVersion['id']) => {
        if (typeof id === 'undefined') { return legalEngine.getFormVersion(); }

        return legalEngine.getFormVersion(id);
    });

    ipcMain.handle('LegalEngine.removeFormVersion', async (_event, id: LegalFormVersion['id']) => { await legalEngine.removeFormVersion(id); });

    ipcMain.handle('LegalEngine.removeForm', async (_event, id: LegalForm['id']) => { await legalEngine.removeForm(id); });

    ipcMain.handle('LegalEngine.newSignature', async (_event, signatureCapture: LegalFormSignatureDraft) => legalEngine.newSignature(signatureCapture));

    ipcMain.handle('LegalEngine.getSignature', async (_event, id?: LegalFormSignature['id']) => {
        if (typeof id === 'undefined') { return legalEngine.getSignature(); }

        return legalEngine.getSignature(id);
    });

    // #endregion Legal Engine
}
