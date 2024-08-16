/* istanbul ignore file */

import { BigNumber } from '@polymeshassociation/polymesh-private-sdk';

import { AuditorVerifySenderProofDto } from '~/confidential-proofs/dto/auditor-verify-sender-proof.dto';
import { ReceiverVerifySenderProofDto } from '~/confidential-proofs/dto/receiver-verify-sender-proof.dto';

export enum ConfidentialTransactionDirectionEnum {
  All = 'All',
  Incoming = 'Incoming',
  Outgoing = 'Outgoing',
}

interface RequestTracker {
  legId: BigNumber;
  assetId: string;
  amountGiven: BigNumber | null;
  isAuditor: boolean;
}

interface AuditorRequest {
  confidentialAccount: string;
  params: AuditorVerifySenderProofDto;
  trackers: RequestTracker;
  type: 'auditor';
}

interface ReceiverRequest {
  confidentialAccount: string;
  params: ReceiverVerifySenderProofDto;
  trackers: RequestTracker;
  type: 'receiver';
}

export type ProofDecryptRequest = AuditorRequest | ReceiverRequest;
