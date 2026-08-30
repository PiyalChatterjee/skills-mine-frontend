import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { Alert, Box, Button, ButtonBase, CircularProgress, Typography } from '@mui/material'
import { RecruiterSidebar } from '@/modules/recruiter/components/RecruiterSidebar'
import { RecruiterTour } from '@/modules/recruiter/components/RecruiterTour'
import { ROUTE_PATHS } from '@/routes/routePaths'
import { mandateApi } from '@/services/api/mandateApi'
import { selectMandate } from '@/store/slices/recruiterPipelineSlice'
import type { RecruiterDashboardData, RecruiterMandatesData } from '@/types/api'
import styles from './RecruiterPage.module.css'

// ── Types ─────────────────────────────────────────────────────────────

type PipelineStageLabel =
  | 'Inbound' | 'Screening' | 'Assessment'
  | 'Interview' | 'Shortlisted' | 'Offer' | 'Placed' | 'Closed'

type CardTone = 'cream' | 'lilac' | 'yellow' | 'blush' | 'ice' | 'mint' | 'success' | 'danger'

// Mirrors the API response shape: data[n]
type PipelineCard = {
  applicationId: string           // globally unique — same applicationId cannot appear in more than one column
  applicationPartyId: string
  jobProfile: {
    jobProfileId: string
    positionTitle: string
    clientId: string
    clientName: string
    fillByDate: string
    workType: 'REMOTE' | 'ONSITE' | 'HYBRID'
    employmentType: 'FULL_TIME' | 'PART_TIME' | 'CONTRACT' | 'TEMPORARY'
    status: 'DRAFT' | 'ACTIVE' | 'CLOSED'
  }
  candidate: {
    candidateId: string
    visitorId: string
    firstName: string
    lastName: string
    email: string
    phone: string
    profileStatus: 'COMPLETE' | 'INCOMPLETE'
  }
  assignedRecruiterId: string
  currentStageCode: 'INBOUND' | 'SCREENING' | 'ASSESSMENT' | 'INTERVIEW' | 'SHORTLIST' | 'OFFER' | 'PLACED' | 'CLOSED'
  applicationStatus: 'SUBMITTED' | 'IN_PROGRESS' | 'ACCEPTED' | 'REJECTED' | 'WITHDRAWN'
  sourceCode: 'CANDIDATE_APPLIED' | 'RECRUITER_SOURCED' | 'REFERRAL'
  matchScoreLatest: number
  offerDetails: {
    offeredSalary: number
    currencyCode: string
    startDate: string
    offerDate: string
    validUntil: string
    responseStatus: 'PENDING' | 'ACCEPTED' | 'DECLINED'
  } | null
  createdAt: string
  closedAt: string | null
  // UI-only display helpers
  companyIcon: string
  tone: CardTone
  stage: PipelineStageLabel
}

type PipelineColumn = {
  label: PipelineStageLabel
  colorClass: string
  cards: PipelineCard[]
}

// ── Constants ─────────────────────────────────────────────────────────

// 30 jobs total — applicationId is the unique key; no applicationId repeats across columns.
// Distribution: Inbound×6, Screening×5, Assessment×5, Interview×5, Shortlisted×3, Offer×4, Placed×0, Closed×2
const PIPELINE_COLUMNS: PipelineColumn[] = [
  {
    label: 'Inbound',
    colorClass: styles.colInbound,
    cards: [
      {
        applicationId: 'a1b2c3d4-0001-4e5f-8a9b-000000000001',
        applicationPartyId: 'p1b2c3d4-0001-4e5f-8a9b-000000000001',
        jobProfile: { jobProfileId: 'jp000001', positionTitle: 'Senior Developer', clientId: 'cl000001', clientName: 'Standard Bank', fillByDate: '2026-03-01', workType: 'REMOTE', employmentType: 'FULL_TIME', status: 'ACTIVE' },
        candidate: { candidateId: 'cd000001', visitorId: 'vi000001', firstName: 'James', lastName: 'Nkosi', email: 'james.nkosi@example.com', phone: '+27821000001', profileStatus: 'COMPLETE' },
        assignedRecruiterId: 'rec-001', currentStageCode: 'INBOUND', applicationStatus: 'SUBMITTED', sourceCode: 'CANDIDATE_APPLIED', matchScoreLatest: 88,
        offerDetails: null, createdAt: '2026-01-10T08:00:00.000Z', closedAt: null,
        companyIcon: '🛡', tone: 'cream', stage: 'Inbound',
      },
      {
        applicationId: 'a1b2c3d4-0002-4e5f-8a9b-000000000002',
        applicationPartyId: 'p1b2c3d4-0002-4e5f-8a9b-000000000002',
        jobProfile: { jobProfileId: 'jp000002', positionTitle: 'Accounts Payable Clerk', clientId: 'cl000002', clientName: 'Wexford Search', fillByDate: '2026-03-05', workType: 'ONSITE', employmentType: 'FULL_TIME', status: 'ACTIVE' },
        candidate: { candidateId: 'cd000002', visitorId: 'vi000002', firstName: 'Thabo', lastName: 'Dlamini', email: 'thabo.dlamini@example.com', phone: '+27821000002', profileStatus: 'COMPLETE' },
        assignedRecruiterId: 'rec-001', currentStageCode: 'INBOUND', applicationStatus: 'SUBMITTED', sourceCode: 'RECRUITER_SOURCED', matchScoreLatest: 74,
        offerDetails: null, createdAt: '2026-01-11T08:00:00.000Z', closedAt: null,
        companyIcon: '♨', tone: 'cream', stage: 'Inbound',
      },
      {
        applicationId: 'a1b2c3d4-0003-4e5f-8a9b-000000000003',
        applicationPartyId: 'p1b2c3d4-0003-4e5f-8a9b-000000000003',
        jobProfile: { jobProfileId: 'jp000003', positionTitle: 'Head of Transport', clientId: 'cl000003', clientName: 'GIBB Pty Ltd', fillByDate: '2026-03-10', workType: 'HYBRID', employmentType: 'FULL_TIME', status: 'ACTIVE' },
        candidate: { candidateId: 'cd000003', visitorId: 'vi000003', firstName: 'Sipho', lastName: 'Mthembu', email: 'sipho.mthembu@example.com', phone: '+27821000003', profileStatus: 'INCOMPLETE' },
        assignedRecruiterId: 'rec-001', currentStageCode: 'INBOUND', applicationStatus: 'SUBMITTED', sourceCode: 'CANDIDATE_APPLIED', matchScoreLatest: 65,
        offerDetails: null, createdAt: '2026-01-12T08:00:00.000Z', closedAt: null,
        companyIcon: '◉', tone: 'cream', stage: 'Inbound',
      },
      {
        applicationId: 'a1b2c3d4-0004-4e5f-8a9b-000000000004',
        applicationPartyId: 'p1b2c3d4-0004-4e5f-8a9b-000000000004',
        jobProfile: { jobProfileId: 'jp000004', positionTitle: 'Academic: Bachelor Programme', clientId: 'cl000004', clientName: 'MANCOSA', fillByDate: '2026-03-15', workType: 'ONSITE', employmentType: 'CONTRACT', status: 'ACTIVE' },
        candidate: { candidateId: 'cd000004', visitorId: 'vi000004', firstName: 'Lindiwe', lastName: 'Zulu', email: 'lindiwe.zulu@example.com', phone: '+27821000004', profileStatus: 'COMPLETE' },
        assignedRecruiterId: 'rec-002', currentStageCode: 'INBOUND', applicationStatus: 'SUBMITTED', sourceCode: 'REFERRAL', matchScoreLatest: 91,
        offerDetails: null, createdAt: '2026-01-13T08:00:00.000Z', closedAt: null,
        companyIcon: '♜', tone: 'cream', stage: 'Inbound',
      },
      {
        applicationId: 'a1b2c3d4-0005-4e5f-8a9b-000000000005',
        applicationPartyId: 'p1b2c3d4-0005-4e5f-8a9b-000000000005',
        jobProfile: { jobProfileId: 'jp000005', positionTitle: 'Banking and Treasury Analyst', clientId: 'cl000005', clientName: 'Corporate Placements', fillByDate: '2026-03-20', workType: 'HYBRID', employmentType: 'FULL_TIME', status: 'ACTIVE' },
        candidate: { candidateId: 'cd000005', visitorId: 'vi000005', firstName: 'Nomsa', lastName: 'Khumalo', email: 'nomsa.khumalo@example.com', phone: '+27821000005', profileStatus: 'INCOMPLETE' },
        assignedRecruiterId: 'rec-002', currentStageCode: 'INBOUND', applicationStatus: 'SUBMITTED', sourceCode: 'CANDIDATE_APPLIED', matchScoreLatest: 70,
        offerDetails: null, createdAt: '2026-01-14T08:00:00.000Z', closedAt: null,
        companyIcon: '✉', tone: 'cream', stage: 'Inbound',
      },
      {
        applicationId: 'a1b2c3d4-0006-4e5f-8a9b-000000000006',
        applicationPartyId: 'p1b2c3d4-0006-4e5f-8a9b-000000000006',
        jobProfile: { jobProfileId: 'jp000006', positionTitle: 'Data Engineer', clientId: 'cl000006', clientName: 'Rand Merchant Bank', fillByDate: '2026-03-25', workType: 'REMOTE', employmentType: 'FULL_TIME', status: 'DRAFT' },
        candidate: { candidateId: 'cd000006', visitorId: 'vi000006', firstName: 'Bongani', lastName: 'Mokoena', email: 'bongani.mokoena@example.com', phone: '+27821000006', profileStatus: 'COMPLETE' },
        assignedRecruiterId: 'rec-002', currentStageCode: 'INBOUND', applicationStatus: 'SUBMITTED', sourceCode: 'RECRUITER_SOURCED', matchScoreLatest: 82,
        offerDetails: null, createdAt: '2026-01-15T08:00:00.000Z', closedAt: null,
        companyIcon: '◈', tone: 'cream', stage: 'Inbound',
      },
    ],
  },
  {
    label: 'Screening',
    colorClass: styles.colScreening,
    cards: [
      {
        applicationId: 'b2c3d4e5-0007-4f6a-9b0c-000000000007',
        applicationPartyId: 'p2c3d4e5-0007-4f6a-9b0c-000000000007',
        jobProfile: { jobProfileId: 'jp000007', positionTitle: 'Associate Professor', clientId: 'cl000007', clientName: 'University of Pretoria', fillByDate: '2026-04-01', workType: 'ONSITE', employmentType: 'FULL_TIME', status: 'ACTIVE' },
        candidate: { candidateId: 'cd000007', visitorId: 'vi000007', firstName: 'Ayanda', lastName: 'Ntuli', email: 'ayanda.ntuli@example.com', phone: '+27821000007', profileStatus: 'COMPLETE' },
        assignedRecruiterId: 'rec-001', currentStageCode: 'SCREENING', applicationStatus: 'IN_PROGRESS', sourceCode: 'CANDIDATE_APPLIED', matchScoreLatest: 79,
        offerDetails: null, createdAt: '2026-01-16T08:00:00.000Z', closedAt: null,
        companyIcon: '♟', tone: 'lilac', stage: 'Screening',
      },
      {
        applicationId: 'b2c3d4e5-0008-4f6a-9b0c-000000000008',
        applicationPartyId: 'p2c3d4e5-0008-4f6a-9b0c-000000000008',
        jobProfile: { jobProfileId: 'jp000008', positionTitle: 'QC Analyst - Food', clientId: 'cl000008', clientName: 'Pronto Labour Tech', fillByDate: '2026-04-05', workType: 'ONSITE', employmentType: 'FULL_TIME', status: 'ACTIVE' },
        candidate: { candidateId: 'cd000008', visitorId: 'vi000008', firstName: 'Mpho', lastName: 'Sithole', email: 'mpho.sithole@example.com', phone: '+27821000008', profileStatus: 'COMPLETE' },
        assignedRecruiterId: 'rec-002', currentStageCode: 'SCREENING', applicationStatus: 'IN_PROGRESS', sourceCode: 'RECRUITER_SOURCED', matchScoreLatest: 85,
        offerDetails: null, createdAt: '2026-01-17T08:00:00.000Z', closedAt: null,
        companyIcon: '◉', tone: 'lilac', stage: 'Screening',
      },
      {
        applicationId: 'b2c3d4e5-0009-4f6a-9b0c-000000000009',
        applicationPartyId: 'p2c3d4e5-0009-4f6a-9b0c-000000000009',
        jobProfile: { jobProfileId: 'jp000009', positionTitle: 'Chemistry Analyst', clientId: 'cl000009', clientName: 'Microchem Specialists', fillByDate: '2026-04-10', workType: 'ONSITE', employmentType: 'CONTRACT', status: 'ACTIVE' },
        candidate: { candidateId: 'cd000009', visitorId: 'vi000009', firstName: 'Zanele', lastName: 'Molefe', email: 'zanele.molefe@example.com', phone: '+27821000009', profileStatus: 'INCOMPLETE' },
        assignedRecruiterId: 'rec-001', currentStageCode: 'SCREENING', applicationStatus: 'IN_PROGRESS', sourceCode: 'CANDIDATE_APPLIED', matchScoreLatest: 60,
        offerDetails: null, createdAt: '2026-01-18T08:00:00.000Z', closedAt: null,
        companyIcon: '〽', tone: 'lilac', stage: 'Screening',
      },
      {
        applicationId: 'b2c3d4e5-0010-4f6a-9b0c-000000000010',
        applicationPartyId: 'p2c3d4e5-0010-4f6a-9b0c-000000000010',
        jobProfile: { jobProfileId: 'jp000010', positionTitle: 'Junior Mechanical Engineer', clientId: 'cl000010', clientName: 'Network Engineers SA', fillByDate: '2026-04-15', workType: 'HYBRID', employmentType: 'FULL_TIME', status: 'ACTIVE' },
        candidate: { candidateId: 'cd000010', visitorId: 'vi000010', firstName: 'Lungelo', lastName: 'Shabalala', email: 'lungelo.shabalala@example.com', phone: '+27821000010', profileStatus: 'COMPLETE' },
        assignedRecruiterId: 'rec-002', currentStageCode: 'SCREENING', applicationStatus: 'IN_PROGRESS', sourceCode: 'REFERRAL', matchScoreLatest: 77,
        offerDetails: null, createdAt: '2026-01-19T08:00:00.000Z', closedAt: null,
        companyIcon: '◉', tone: 'lilac', stage: 'Screening',
      },
      {
        applicationId: 'b2c3d4e5-0011-4f6a-9b0c-000000000011',
        applicationPartyId: 'p2c3d4e5-0011-4f6a-9b0c-000000000011',
        jobProfile: { jobProfileId: 'jp000011', positionTitle: 'Human Resources Officer', clientId: 'cl000011', clientName: 'University of KwaZulu-Natal', fillByDate: '2026-04-20', workType: 'ONSITE', employmentType: 'FULL_TIME', status: 'ACTIVE' },
        candidate: { candidateId: 'cd000011', visitorId: 'vi000011', firstName: 'Thandeka', lastName: 'Mchunu', email: 'thandeka.mchunu@example.com', phone: '+27821000011', profileStatus: 'COMPLETE' },
        assignedRecruiterId: 'rec-001', currentStageCode: 'SCREENING', applicationStatus: 'IN_PROGRESS', sourceCode: 'CANDIDATE_APPLIED', matchScoreLatest: 93,
        offerDetails: null, createdAt: '2026-01-20T08:00:00.000Z', closedAt: null,
        companyIcon: '♟', tone: 'lilac', stage: 'Screening',
      },
    ],
  },
  {
    label: 'Assessment',
    colorClass: styles.colAssessment,
    cards: [
      {
        applicationId: 'c3d4e5f6-0012-4a7b-8c1d-000000000012',
        applicationPartyId: 'p3d4e5f6-0012-4a7b-8c1d-000000000012',
        jobProfile: { jobProfileId: 'jp000012', positionTitle: 'Associate Professor', clientId: 'cl000012', clientName: 'University of Cape Town', fillByDate: '2026-05-01', workType: 'ONSITE', employmentType: 'FULL_TIME', status: 'ACTIVE' },
        candidate: { candidateId: 'cd000012', visitorId: 'vi000012', firstName: 'Siphiwe', lastName: 'Dube', email: 'siphiwe.dube@example.com', phone: '+27821000012', profileStatus: 'COMPLETE' },
        assignedRecruiterId: 'rec-002', currentStageCode: 'ASSESSMENT', applicationStatus: 'IN_PROGRESS', sourceCode: 'CANDIDATE_APPLIED', matchScoreLatest: 87,
        offerDetails: null, createdAt: '2026-01-21T08:00:00.000Z', closedAt: null,
        companyIcon: '♟', tone: 'yellow', stage: 'Assessment',
      },
      {
        applicationId: 'c3d4e5f6-0013-4a7b-8c1d-000000000013',
        applicationPartyId: 'p3d4e5f6-0013-4a7b-8c1d-000000000013',
        jobProfile: { jobProfileId: 'jp000013', positionTitle: 'Driver', clientId: 'cl000013', clientName: 'CYA Global', fillByDate: '2026-05-05', workType: 'ONSITE', employmentType: 'FULL_TIME', status: 'ACTIVE' },
        candidate: { candidateId: 'cd000013', visitorId: 'vi000013', firstName: 'Siyanda', lastName: 'Gumede', email: 'siyanda.gumede@example.com', phone: '+27821000013', profileStatus: 'INCOMPLETE' },
        assignedRecruiterId: 'rec-001', currentStageCode: 'ASSESSMENT', applicationStatus: 'IN_PROGRESS', sourceCode: 'RECRUITER_SOURCED', matchScoreLatest: 55,
        offerDetails: null, createdAt: '2026-01-22T08:00:00.000Z', closedAt: null,
        companyIcon: '⚑', tone: 'yellow', stage: 'Assessment',
      },
      {
        applicationId: 'c3d4e5f6-0014-4a7b-8c1d-000000000014',
        applicationPartyId: 'p3d4e5f6-0014-4a7b-8c1d-000000000014',
        jobProfile: { jobProfileId: 'jp000014', positionTitle: 'Mechanical Engineer', clientId: 'cl000014', clientName: 'Ashton Personnel', fillByDate: '2026-05-10', workType: 'HYBRID', employmentType: 'FULL_TIME', status: 'ACTIVE' },
        candidate: { candidateId: 'cd000014', visitorId: 'vi000014', firstName: 'Kwanele', lastName: 'Majola', email: 'kwanele.majola@example.com', phone: '+27821000014', profileStatus: 'COMPLETE' },
        assignedRecruiterId: 'rec-002', currentStageCode: 'ASSESSMENT', applicationStatus: 'IN_PROGRESS', sourceCode: 'CANDIDATE_APPLIED', matchScoreLatest: 81,
        offerDetails: null, createdAt: '2026-01-23T08:00:00.000Z', closedAt: null,
        companyIcon: '♙', tone: 'yellow', stage: 'Assessment',
      },
      {
        applicationId: 'c3d4e5f6-0015-4a7b-8c1d-000000000015',
        applicationPartyId: 'p3d4e5f6-0015-4a7b-8c1d-000000000015',
        jobProfile: { jobProfileId: 'jp000015', positionTitle: 'Sales Representative', clientId: 'cl000015', clientName: 'Professional Field Services', fillByDate: '2026-05-15', workType: 'REMOTE', employmentType: 'CONTRACT', status: 'ACTIVE' },
        candidate: { candidateId: 'cd000015', visitorId: 'vi000015', firstName: 'Yolanda', lastName: 'Ndlovu', email: 'yolanda.ndlovu@example.com', phone: '+27821000015', profileStatus: 'COMPLETE' },
        assignedRecruiterId: 'rec-001', currentStageCode: 'ASSESSMENT', applicationStatus: 'IN_PROGRESS', sourceCode: 'REFERRAL', matchScoreLatest: 69,
        offerDetails: null, createdAt: '2026-01-24T08:00:00.000Z', closedAt: null,
        companyIcon: '⚑', tone: 'yellow', stage: 'Assessment',
      },
      {
        applicationId: 'c3d4e5f6-0016-4a7b-8c1d-000000000016',
        applicationPartyId: 'p3d4e5f6-0016-4a7b-8c1d-000000000016',
        jobProfile: { jobProfileId: 'jp000016', positionTitle: 'KYC Administrator', clientId: 'cl000016', clientName: 'Moladita Management', fillByDate: '2026-05-20', workType: 'HYBRID', employmentType: 'FULL_TIME', status: 'ACTIVE' },
        candidate: { candidateId: 'cd000016', visitorId: 'vi000016', firstName: 'Nkululeko', lastName: 'Zwane', email: 'nkululeko.zwane@example.com', phone: '+27821000016', profileStatus: 'INCOMPLETE' },
        assignedRecruiterId: 'rec-002', currentStageCode: 'ASSESSMENT', applicationStatus: 'IN_PROGRESS', sourceCode: 'CANDIDATE_APPLIED', matchScoreLatest: 72,
        offerDetails: null, createdAt: '2026-01-25T08:00:00.000Z', closedAt: null,
        companyIcon: '⚑', tone: 'yellow', stage: 'Assessment',
      },
    ],
  },
  {
    label: 'Interview',
    colorClass: styles.colInterview,
    cards: [
      {
        applicationId: 'd4e5f6a7-0017-4b8c-9d2e-000000000017',
        applicationPartyId: 'p4e5f6a7-0017-4b8c-9d2e-000000000017',
        jobProfile: { jobProfileId: 'jp000017', positionTitle: 'Logistics Controller', clientId: 'cl000017', clientName: 'TC Construction', fillByDate: '2026-06-01', workType: 'ONSITE', employmentType: 'FULL_TIME', status: 'ACTIVE' },
        candidate: { candidateId: 'cd000017', visitorId: 'vi000017', firstName: 'Musa', lastName: 'Hadebe', email: 'musa.hadebe@example.com', phone: '+27821000017', profileStatus: 'COMPLETE' },
        assignedRecruiterId: 'rec-001', currentStageCode: 'INTERVIEW', applicationStatus: 'IN_PROGRESS', sourceCode: 'RECRUITER_SOURCED', matchScoreLatest: 90,
        offerDetails: null, createdAt: '2026-01-26T08:00:00.000Z', closedAt: null,
        companyIcon: '▣', tone: 'blush', stage: 'Interview',
      },
      {
        applicationId: 'd4e5f6a7-0018-4b8c-9d2e-000000000018',
        applicationPartyId: 'p4e5f6a7-0018-4b8c-9d2e-000000000018',
        jobProfile: { jobProfileId: 'jp000018', positionTitle: 'Associate Professor', clientId: 'cl000018', clientName: 'University of Witwatersrand', fillByDate: '2026-06-05', workType: 'ONSITE', employmentType: 'FULL_TIME', status: 'ACTIVE' },
        candidate: { candidateId: 'cd000018', visitorId: 'vi000018', firstName: 'Portia', lastName: 'Mahlangu', email: 'portia.mahlangu@example.com', phone: '+27821000018', profileStatus: 'COMPLETE' },
        assignedRecruiterId: 'rec-002', currentStageCode: 'INTERVIEW', applicationStatus: 'IN_PROGRESS', sourceCode: 'CANDIDATE_APPLIED', matchScoreLatest: 95,
        offerDetails: null, createdAt: '2026-01-27T08:00:00.000Z', closedAt: null,
        companyIcon: '♟', tone: 'blush', stage: 'Interview',
      },
      {
        applicationId: 'd4e5f6a7-0019-4b8c-9d2e-000000000019',
        applicationPartyId: 'p4e5f6a7-0019-4b8c-9d2e-000000000019',
        jobProfile: { jobProfileId: 'jp000019', positionTitle: 'Operations Systems Analyst', clientId: 'cl000019', clientName: 'Network IT', fillByDate: '2026-06-10', workType: 'HYBRID', employmentType: 'FULL_TIME', status: 'ACTIVE' },
        candidate: { candidateId: 'cd000019', visitorId: 'vi000019', firstName: 'Sibusiso', lastName: 'Ngcobo', email: 'sibusiso.ngcobo@example.com', phone: '+27821000019', profileStatus: 'COMPLETE' },
        assignedRecruiterId: 'rec-001', currentStageCode: 'INTERVIEW', applicationStatus: 'IN_PROGRESS', sourceCode: 'REFERRAL', matchScoreLatest: 83,
        offerDetails: null, createdAt: '2026-01-28T08:00:00.000Z', closedAt: null,
        companyIcon: '◉', tone: 'blush', stage: 'Interview',
      },
      {
        applicationId: 'd4e5f6a7-0020-4b8c-9d2e-000000000020',
        applicationPartyId: 'p4e5f6a7-0020-4b8c-9d2e-000000000020',
        jobProfile: { jobProfileId: 'jp000020', positionTitle: 'Property Valuator', clientId: 'cl000020', clientName: 'Somewhere Properties', fillByDate: '2026-06-15', workType: 'ONSITE', employmentType: 'CONTRACT', status: 'ACTIVE' },
        candidate: { candidateId: 'cd000020', visitorId: 'vi000020', firstName: 'Sandile', lastName: 'Buthelezi', email: 'sandile.buthelezi@example.com', phone: '+27821000020', profileStatus: 'INCOMPLETE' },
        assignedRecruiterId: 'rec-002', currentStageCode: 'INTERVIEW', applicationStatus: 'IN_PROGRESS', sourceCode: 'CANDIDATE_APPLIED', matchScoreLatest: 67,
        offerDetails: null, createdAt: '2026-01-29T08:00:00.000Z', closedAt: null,
        companyIcon: 'S', tone: 'blush', stage: 'Interview',
      },
      {
        applicationId: 'd4e5f6a7-0021-4b8c-9d2e-000000000021',
        applicationPartyId: 'p4e5f6a7-0021-4b8c-9d2e-000000000021',
        jobProfile: { jobProfileId: 'jp000021', positionTitle: 'University Graduate Nurse', clientId: 'cl000021', clientName: 'Life Healthcare Group', fillByDate: '2026-06-20', workType: 'ONSITE', employmentType: 'FULL_TIME', status: 'ACTIVE' },
        candidate: { candidateId: 'cd000021', visitorId: 'vi000021', firstName: 'Ntombi', lastName: 'Cele', email: 'ntombi.cele@example.com', phone: '+27821000021', profileStatus: 'COMPLETE' },
        assignedRecruiterId: 'rec-001', currentStageCode: 'INTERVIEW', applicationStatus: 'IN_PROGRESS', sourceCode: 'RECRUITER_SOURCED', matchScoreLatest: 78,
        offerDetails: null, createdAt: '2026-01-30T08:00:00.000Z', closedAt: null,
        companyIcon: '▣', tone: 'blush', stage: 'Interview',
      },
    ],
  },
  {
    label: 'Shortlisted',
    colorClass: styles.colShortlist,
    cards: [
      {
        applicationId: 'e5f6a7b8-0022-4c9d-0e3f-000000000022',
        applicationPartyId: 'p5f6a7b8-0022-4c9d-0e3f-000000000022',
        jobProfile: { jobProfileId: 'jp000022', positionTitle: 'Water Treatment Specialist', clientId: 'cl000022', clientName: 'MayFly Agri (pty)', fillByDate: '2026-07-01', workType: 'ONSITE', employmentType: 'FULL_TIME', status: 'ACTIVE' },
        candidate: { candidateId: 'cd000022', visitorId: 'vi000022', firstName: 'Lethiwe', lastName: 'Nxumalo', email: 'lethiwe.nxumalo@example.com', phone: '+27821000022', profileStatus: 'COMPLETE' },
        assignedRecruiterId: 'rec-002', currentStageCode: 'SHORTLIST', applicationStatus: 'IN_PROGRESS', sourceCode: 'CANDIDATE_APPLIED', matchScoreLatest: 96,
        offerDetails: null, createdAt: '2026-02-01T08:00:00.000Z', closedAt: null,
        companyIcon: '▣', tone: 'ice', stage: 'Shortlisted',
      },
      {
        applicationId: 'e5f6a7b8-0023-4c9d-0e3f-000000000023',
        applicationPartyId: 'p5f6a7b8-0023-4c9d-0e3f-000000000023',
        jobProfile: { jobProfileId: 'jp000023', positionTitle: 'Experienced Accountant', clientId: 'cl000023', clientName: 'Full Service Cartography', fillByDate: '2026-07-05', workType: 'HYBRID', employmentType: 'FULL_TIME', status: 'ACTIVE' },
        candidate: { candidateId: 'cd000023', visitorId: 'vi000023', firstName: 'Nokuthula', lastName: 'Mbatha', email: 'nokuthula.mbatha@example.com', phone: '+27821000023', profileStatus: 'COMPLETE' },
        assignedRecruiterId: 'rec-001', currentStageCode: 'SHORTLIST', applicationStatus: 'IN_PROGRESS', sourceCode: 'REFERRAL', matchScoreLatest: 89,
        offerDetails: null, createdAt: '2026-02-02T08:00:00.000Z', closedAt: null,
        companyIcon: '⌁', tone: 'ice', stage: 'Shortlisted',
      },
      {
        applicationId: 'e5f6a7b8-0024-4c9d-0e3f-000000000024',
        applicationPartyId: 'p5f6a7b8-0024-4c9d-0e3f-000000000024',
        jobProfile: { jobProfileId: 'jp000024', positionTitle: 'Work Integrated Learning Coord', clientId: 'cl000024', clientName: 'ATS Testing', fillByDate: '2026-07-10', workType: 'ONSITE', employmentType: 'CONTRACT', status: 'ACTIVE' },
        candidate: { candidateId: 'cd000024', visitorId: 'vi000024', firstName: 'Palesa', lastName: 'Sithole', email: 'palesa.sithole@example.com', phone: '+27821000024', profileStatus: 'INCOMPLETE' },
        assignedRecruiterId: 'rec-002', currentStageCode: 'SHORTLIST', applicationStatus: 'IN_PROGRESS', sourceCode: 'CANDIDATE_APPLIED', matchScoreLatest: 75,
        offerDetails: null, createdAt: '2026-02-03T08:00:00.000Z', closedAt: null,
        companyIcon: '◉', tone: 'ice', stage: 'Shortlisted',
      },
    ],
  },
  {
    label: 'Offer',
    colorClass: styles.colOffer,
    cards: [
      {
        applicationId: 'f6a7b8c9-0025-4d0e-1f4a-000000000025',
        applicationPartyId: 'p6a7b8c9-0025-4d0e-1f4a-000000000025',
        jobProfile: { jobProfileId: 'jp000025', positionTitle: 'Accounts Payable Manager', clientId: 'cl000025', clientName: 'Communicate Finance', fillByDate: '2026-08-01', workType: 'HYBRID', employmentType: 'FULL_TIME', status: 'ACTIVE' },
        candidate: { candidateId: 'cd000025', visitorId: 'vi000025', firstName: 'Dineo', lastName: 'Ramaphosa', email: 'dineo.ramaphosa@example.com', phone: '+27821000025', profileStatus: 'COMPLETE' },
        assignedRecruiterId: 'rec-001', currentStageCode: 'OFFER', applicationStatus: 'IN_PROGRESS', sourceCode: 'RECRUITER_SOURCED', matchScoreLatest: 92,
        offerDetails: { offeredSalary: 68000, currencyCode: 'ZAR', startDate: '2026-09-01', offerDate: '2026-08-01', validUntil: '2026-08-15', responseStatus: 'PENDING' },
        createdAt: '2026-02-05T08:00:00.000Z', closedAt: null,
        companyIcon: '▣', tone: 'mint', stage: 'Offer',
      },
      {
        applicationId: 'f6a7b8c9-0026-4d0e-1f4a-000000000026',
        applicationPartyId: 'p6a7b8c9-0026-4d0e-1f4a-000000000026',
        jobProfile: { jobProfileId: 'jp000026', positionTitle: 'Portfolio Manager', clientId: 'cl000026', clientName: 'Humankind Group', fillByDate: '2026-08-05', workType: 'REMOTE', employmentType: 'FULL_TIME', status: 'ACTIVE' },
        candidate: { candidateId: 'cd000026', visitorId: 'vi000026', firstName: 'Nhlanhla', lastName: 'Msomi', email: 'nhlanhla.msomi@example.com', phone: '+27821000026', profileStatus: 'COMPLETE' },
        assignedRecruiterId: 'rec-002', currentStageCode: 'OFFER', applicationStatus: 'IN_PROGRESS', sourceCode: 'CANDIDATE_APPLIED', matchScoreLatest: 97,
        offerDetails: { offeredSalary: 95000, currencyCode: 'ZAR', startDate: '2026-09-01', offerDate: '2026-08-05', validUntil: '2026-08-20', responseStatus: 'PENDING' },
        createdAt: '2026-02-06T08:00:00.000Z', closedAt: null,
        companyIcon: '▣', tone: 'mint', stage: 'Offer',
      },
      {
        applicationId: 'f6a7b8c9-0027-4d0e-1f4a-000000000027',
        applicationPartyId: 'p6a7b8c9-0027-4d0e-1f4a-000000000027',
        jobProfile: { jobProfileId: 'jp000027', positionTitle: 'Graduate (BA Economics)', clientId: 'cl000027', clientName: 'Unique Personnel', fillByDate: '2026-08-10', workType: 'ONSITE', employmentType: 'FULL_TIME', status: 'ACTIVE' },
        candidate: { candidateId: 'cd000027', visitorId: 'vi000027', firstName: 'Lungisa', lastName: 'Mthethwa', email: 'lungisa.mthethwa@example.com', phone: '+27821000027', profileStatus: 'COMPLETE' },
        assignedRecruiterId: 'rec-001', currentStageCode: 'OFFER', applicationStatus: 'IN_PROGRESS', sourceCode: 'REFERRAL', matchScoreLatest: 84,
        offerDetails: { offeredSalary: 32000, currencyCode: 'ZAR', startDate: '2026-09-01', offerDate: '2026-08-10', validUntil: '2026-08-25', responseStatus: 'PENDING' },
        createdAt: '2026-02-07T08:00:00.000Z', closedAt: null,
        companyIcon: '♙', tone: 'mint', stage: 'Offer',
      },
      {
        applicationId: 'f6a7b8c9-0028-4d0e-1f4a-000000000028',
        applicationPartyId: 'p6a7b8c9-0028-4d0e-1f4a-000000000028',
        jobProfile: { jobProfileId: 'jp000028', positionTitle: 'Banking Advisor', clientId: 'cl000028', clientName: 'FNB (Private Segment)', fillByDate: '2026-08-15', workType: 'HYBRID', employmentType: 'FULL_TIME', status: 'ACTIVE' },
        candidate: { candidateId: 'cd000028', visitorId: 'vi000028', firstName: 'Samkelo', lastName: 'Khoza', email: 'samkelo.khoza@example.com', phone: '+27821000028', profileStatus: 'COMPLETE' },
        assignedRecruiterId: 'rec-002', currentStageCode: 'OFFER', applicationStatus: 'IN_PROGRESS', sourceCode: 'RECRUITER_SOURCED', matchScoreLatest: 100,
        offerDetails: { offeredSalary: 75000, currencyCode: 'ZAR', startDate: '2026-09-01', offerDate: '2026-08-15', validUntil: '2026-08-31', responseStatus: 'PENDING' },
        createdAt: '2026-02-08T08:00:00.000Z', closedAt: null,
        companyIcon: '▣', tone: 'mint', stage: 'Offer',
      },
    ],
  },
  {
    label: 'Placed',
    colorClass: styles.colOffer,
    cards: [],
  },
  {
    label: 'Closed',
    colorClass: styles.colClosed,
    cards: [
      {
        applicationId: 'a7b8c9d0-0029-4e1f-2a5b-000000000029',
        applicationPartyId: 'p7b8c9d0-0029-4e1f-2a5b-000000000029',
        jobProfile: { jobProfileId: 'jp000029', positionTitle: 'Export Sales Specialist', clientId: 'cl000029', clientName: 'Luma Consulting', fillByDate: '2025-12-01', workType: 'REMOTE', employmentType: 'FULL_TIME', status: 'CLOSED' },
        candidate: { candidateId: 'cd000029', visitorId: 'vi000029', firstName: 'Zinhle', lastName: 'Msweli', email: 'zinhle.msweli@example.com', phone: '+27821000029', profileStatus: 'COMPLETE' },
        assignedRecruiterId: 'rec-001', currentStageCode: 'CLOSED', applicationStatus: 'ACCEPTED', sourceCode: 'CANDIDATE_APPLIED', matchScoreLatest: 94,
        offerDetails: { offeredSalary: 58000, currencyCode: 'ZAR', startDate: '2026-01-02', offerDate: '2025-12-01', validUntil: '2025-12-15', responseStatus: 'ACCEPTED' },
        createdAt: '2025-10-01T08:00:00.000Z', closedAt: '2025-12-20T08:00:00.000Z',
        companyIcon: '▣', tone: 'success', stage: 'Closed',
      },
      {
        applicationId: 'a7b8c9d0-0030-4e1f-2a5b-000000000030',
        applicationPartyId: 'p7b8c9d0-0030-4e1f-2a5b-000000000030',
        jobProfile: { jobProfileId: 'jp000030', positionTitle: 'Production Engineer', clientId: 'cl000030', clientName: 'Lascom Management', fillByDate: '2025-11-15', workType: 'ONSITE', employmentType: 'FULL_TIME', status: 'CLOSED' },
        candidate: { candidateId: 'cd000030', visitorId: 'vi000030', firstName: 'Mandla', lastName: 'Nkosi', email: 'mandla.nkosi@example.com', phone: '+27821000030', profileStatus: 'COMPLETE' },
        assignedRecruiterId: 'rec-002', currentStageCode: 'CLOSED', applicationStatus: 'REJECTED', sourceCode: 'RECRUITER_SOURCED', matchScoreLatest: 61,
        offerDetails: null, createdAt: '2025-09-15T08:00:00.000Z', closedAt: '2025-11-30T08:00:00.000Z',
        companyIcon: '▣', tone: 'danger', stage: 'Closed',
      },
    ],
  },
]

// ── Sub-components ────────────────────────────────────────────────────

const CvsDueIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <rect x="4" y="3" width="16" height="18" rx="2" stroke="currentColor" strokeWidth="1.7" />
    <path d="M8 8h8M8 12h8M8 16h5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
  </svg>
)

const InterviewsIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <circle cx="12" cy="8" r="3.5" stroke="currentColor" strokeWidth="1.7" />
    <path d="M4 20c0-4.418 3.582-8 8-8s8 3.582 8 8" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
  </svg>
)

const OfferLetterIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <rect x="3" y="5" width="18" height="14" rx="2" stroke="currentColor" strokeWidth="1.7" />
    <path d="M3 8l9 6 9-6" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

type KpiCardProps = {
  value: number
  label: string
  icon: React.ReactNode
  colorClass: string
  onView: () => void
}

const KpiCard = ({ value, label, icon, colorClass, onView }: KpiCardProps) => (
  <Box className={`${styles.kpiCard} ${colorClass}`}>
    <Box className={styles.kpiTop}>
      <Typography component="p" className={styles.kpiValue}>{value}</Typography>
      <Box className={styles.kpiIcon} aria-hidden="true">{icon}</Box>
    </Box>
    <Typography component="p" className={styles.kpiLabel}>{label}</Typography>
    <Box className={styles.kpiSpacer} />
    <Box className={styles.kpiDivider} />
    <ButtonBase className={styles.kpiViewBtn} onClick={onView} disableRipple>
      View →
    </ButtonBase>
  </Box>
)

type PipelineCardProps = {
  card: PipelineCard
  onView: (applicationId: string, stage: PipelineStageLabel) => void
}

const PipelineCardItem = ({ card, onView }: PipelineCardProps) => (
  <Box className={`${styles.pipelineCard} ${styles[`card${card.tone[0].toUpperCase()}${card.tone.slice(1)}`]}`}>
    <Typography component="p" className={styles.pipelineCardTitle}>{card.jobProfile.positionTitle}</Typography>
    <Box className={styles.pipelineCardCompany}>
      <Box component="span" className={styles.pipelineCardCompanyIcon}>{card.companyIcon}</Box>
      <Typography component="span" className={styles.pipelineCardCompanyName}>
        {card.jobProfile.clientName}
      </Typography>
    </Box>
    <Box className={styles.pipelineCardActions}>
      <ButtonBase
        className={styles.pipelineCardViewBtn}
        onClick={() => onView(card.applicationId, card.stage)}
        disableRipple
        aria-label="View"
      >
        <Box component="span" className={styles.pipelineCardViewBtnIcon} aria-hidden="true">
          <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
            <path d="M5 3.5L8.5 6.5L5 9.5" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </Box>
        View
      </ButtonBase>
    </Box>
  </Box>
)

// ── Main Component ────────────────────────────────────────────────────

const RecruiterPage = () => {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const [dashboardData, setDashboardData] = useState<RecruiterDashboardData | null>(null)
  const [mandatesData, setMandatesData] = useState<RecruiterMandatesData | null>(null)
  const [loading, setLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  useEffect(() => {
    let isActive = true

    const loadDashboard = async () => {
      try {
        setLoading(true)
        setErrorMessage(null)

        const [dashboardResponse, mandatesResponse] = await Promise.all([
          mandateApi.getRecruiterDashboard(),
          mandateApi.listRecruiterMandates({ page: 1, limit: 12 }),
        ])

        if (!isActive) {
          return
        }

        setDashboardData(dashboardResponse.data)
        setMandatesData(mandatesResponse.data)
      } catch (error) {
        if (!isActive) {
          return
        }

        const message =
          typeof error === 'object' && error !== null && 'message' in error
            ? String((error as { message?: unknown }).message ?? 'Failed to load recruiter dashboard.')
            : 'Failed to load recruiter dashboard.'
        setErrorMessage(message)
      } finally {
        if (isActive) {
          setLoading(false)
        }
      }
    }

    void loadDashboard()

    return () => {
      isActive = false
    }
  }, [])

  const stageCounts = useMemo(() => {
    const counts: Record<PipelineStageLabel, number> = {
      Inbound: 0,
      Screening: 0,
      Assessment: 0,
      Interview: 0,
      Shortlisted: 0,
      Offer: 0,
      Placed: 0,
      Closed: 0,
    }

    dashboardData?.pipeline.forEach((stage) => {
      const normalized = stage.stage.trim().toLowerCase()
      if (normalized === 'inbound') counts.Inbound = stage.count
      if (normalized === 'screening') counts.Screening = stage.count
      if (normalized === 'assessment') counts.Assessment = stage.count
      if (normalized === 'interview') counts.Interview = stage.count
      if (normalized === 'shortlisted') counts.Shortlisted = stage.count
      if (normalized === 'offer') counts.Offer = stage.count
      if (normalized === 'placed') counts.Placed = stage.count
      if (normalized === 'closed') counts.Closed = stage.count
    })

    return counts
  }, [dashboardData])

  const defaultApplicationId = PIPELINE_COLUMNS[0]?.cards[0]?.applicationId ?? 'a1b2c3d4-0001-4e5f-8a9b-000000000001'

  const handleNewJobPost = () => {
    navigate(ROUTE_PATHS.recruiterNewJobPost)
  }

  const handleViewCvsDue = () => {
    dispatch(selectMandate(defaultApplicationId))
    navigate(ROUTE_PATHS.recruiterMandate.replace(':cardId', defaultApplicationId))
  }

  const handleViewInterviews = () => {
    dispatch(selectMandate(defaultApplicationId))
    navigate(ROUTE_PATHS.recruiterMandate.replace(':cardId', defaultApplicationId))
  }

  const handleViewOfferLetters = () => {
    dispatch(selectMandate(defaultApplicationId))
    navigate(ROUTE_PATHS.recruiterMandate.replace(':cardId', defaultApplicationId))
  }

  const handleViewMore = () => {
    navigate(ROUTE_PATHS.recruiter)
  }

  const handleCardView = (applicationId: string, _stage: PipelineStageLabel) => {
    dispatch(selectMandate(applicationId))
    navigate(ROUTE_PATHS.recruiterMandate.replace(':cardId', applicationId))
  }

  if (loading) {
    return (
      <Box className={styles.shell}>
        <RecruiterSidebar />
        <Box className={styles.pageRoot}>
          <CircularProgress />
        </Box>
      </Box>
    )
  }

  return (
    <Box className={styles.shell}>
      <RecruiterTour />
      <RecruiterSidebar />

      <Box className={styles.pageRoot}>
      {errorMessage ? <Alert severity="error">{errorMessage}</Alert> : null}
      {/* ── Page Header ── */}
      <Box className={styles.pageHeader}>
        <Typography component="h1" className={styles.pageTitle}>
          Universal Job Pipeline
        </Typography>
        <Button
          variant="contained"
          className={styles.newMandateBtn}
          onClick={handleNewJobPost}
          disableElevation
        >
          New Job Post
        </Button>
      </Box>

      {/* ── Welcome Banner ── */}
      <Box component="section" className={styles.welcomeBanner} data-tour="welcome-banner">
        <Box className={styles.welcomeTextCol}>
          <Typography component="p" className={styles.welcomeGreeting}>
            Hi Michael
          </Typography>
          <Typography component="p" className={styles.welcomeSubtitle}>
            Here's a snapshot of what you need to do this week
          </Typography>
        </Box>
        <Box className={styles.kpiRow}>
          <KpiCard
            value={stageCounts.Inbound}
            label="CVs due"
            icon={<CvsDueIcon />}
            colorClass={styles.kpiBlue}
            onView={handleViewCvsDue}
          />
          <KpiCard
            value={stageCounts.Interview}
            label="Interviews to schedule"
            icon={<InterviewsIcon />}
            colorClass={styles.kpiPurple}
            onView={handleViewInterviews}
          />
          <KpiCard
            value={stageCounts.Offer}
            label="Offer Letter Acceptance Deadlines"
            icon={<OfferLetterIcon />}
            colorClass={styles.kpiAmber}
            onView={handleViewOfferLetters}
          />
        </Box>
      </Box>

      {/* ── Recruitment Pipeline ── */}
      <Box component="section" className={styles.pipelineSection}>
        <Typography component="h2" className={styles.sectionTitle}>
          Recruitment Pipeline
        </Typography>
        <Typography component="p" className={styles.sectionSubtitle}>
          {`${mandatesData?.pagination.total ?? 0} active mandates`}
        </Typography>

        <Box className={styles.pipelineWrapper}>
          {/* Unified header bar */}
          <Box className={styles.pipelineHeader}>
            {PIPELINE_COLUMNS.map((col) => (
              <Box key={col.label} className={styles.colHeader}>
                <Typography component="p" className={styles.colLabel}>{col.label}</Typography>
                <Typography component="p" className={styles.colCount}>
                  {stageCounts[col.label]}
                </Typography>
              </Box>
            ))}
          </Box>

          {/* Cards board */}
          <Box className={styles.pipelineBoard}>
            {PIPELINE_COLUMNS.map((col) => (
              <Box key={col.label} className={styles.pipelineColumn}>
                <Box className={styles.colCards}>
                  {col.cards.map((card) => (
                    <PipelineCardItem
                      key={card.applicationId}
                      card={card}
                      onView={handleCardView}
                    />
                  ))}
                </Box>

                <ButtonBase
                  className={styles.viewMoreBtn}
                  onClick={handleViewMore}
                  disableRipple
                >
                  View more
                </ButtonBase>
              </Box>
            ))}
          </Box>
        </Box>
      </Box>
      </Box>
    </Box>
  )
}

export default RecruiterPage
