export type UserRole = 'requester' | 'owner' | 'manager' | 'admin';

export interface UserProfile {
  id: string;
  display_name: string;
  email: string;
  role: UserRole;
  organisation_id: string;
  organisation_name: string;
  department: string;
  avatar_url?: string;
  verified_trainings: string[];
}

export type ResourceCategory =
  | 'Computers and Laptops'
  | 'Laboratory Equipment'
  | 'Engineering Tools'
  | 'Robotics Equipment'
  | 'Photography and Audio Equipment'
  | 'Meeting Rooms'
  | 'Classrooms'
  | 'Workshops and Makerspaces'
  | 'Other Shared Resources';

export type ResourceStatus = 'active' | 'draft' | 'paused' | 'archived';

export type FAQCategory = 'usage' | 'safety' | 'maintenance' | 'booking';

export interface EquipmentFAQ {
  id: string;
  category: FAQCategory;
  question: string;
  answer: string;
  importantNote?: string;
  steps?: string[];
  tags?: string[];
}

export interface ResourceItem {
  id: string;
  title: string;
  category: ResourceCategory;
  description: string;
  location_label: string;
  building: string;
  room: string;
  owner_id: string;
  owner_name: string;
  owner_email: string;
  organisation_id: string;
  organisation_name: string;
  image_url: string;
  gallery: string[];
  specifications: Record<string, string>;
  rules: string[];
  eligibility_rules: {
    restricted?: boolean;
    min_role?: UserRole;
    department?: string;
    required_training?: string[];
  };
  supervision_required: boolean;
  max_duration_hours: number;
  availability_schedule: string;
  requires_approval: boolean;
  status: ResourceStatus;
  cost_per_hour: number;
  cost_label: string;
  cost_billing_model?: string;
  average_rating?: number;
  total_reviews?: number;
  faqs?: EquipmentFAQ[];
  created_at: string;
  updated_at: string;
}

export type BookingStatus =
  | 'draft'
  | 'pending'
  | 'approved'
  | 'rejected'
  | 'cancelled'
  | 'checked_out'
  | 'return_pending'
  | 'returned'
  | 'overdue'
  | 'review_required';

export interface Booking {
  id: string;
  resource_id: string;
  resource_title: string;
  resource_category: ResourceCategory;
  resource_image: string;
  location_label: string;
  requester_id: string;
  requester_name: string;
  requester_email: string;
  requester_department: string;
  start_at: string; // ISO string
  end_at: string; // ISO string
  purpose: string;
  num_users: number;
  training_confirmed: boolean;
  rules_agreed: boolean;
  status: BookingStatus;
  eligibility_status: 'not_required' | 'pending' | 'verified' | 'rejected';
  decision_by?: string;
  decision_at?: string;
  decision_reason?: string;
  reviewed?: boolean;
  review_id?: string;
  rating?: number;
  created_at: string;
  updated_at: string;
}

export interface ResourceReview {
  id: string;
  booking_id: string;
  resource_id: string;
  resource_title: string;
  user_id: string;
  user_name: string;
  user_department: string;
  rating: number; // 1 to 5
  comment: string;
  reliability_score?: number; // 1 to 5
  cleanliness_score?: number; // 1 to 5
  created_at: string;
}

export type ItemCondition = 'excellent' | 'good' | 'fair' | 'damaged' | 'not_assessed';

export interface CheckinRecord {
  id: string;
  booking_id: string;
  resource_id: string;
  checked_in_by: string; // staff or owner ID
  checked_in_by_name: string;
  checked_in_at: string;
  initial_condition: ItemCondition;
  accessories_issued: string[];
  notes: string;
  photo_refs: string[];
}

export interface CheckoutRecord {
  id: string;
  booking_id: string;
  resource_id: string;
  checked_out_by: string;
  checked_out_by_name: string;
  checked_out_at: string;
  final_condition: ItemCondition;
  accessories_returned: string[];
  notes: string;
  photo_refs: string[];
  return_confirmed_by: string;
  return_confirmed_at: string;
}

export type IncidentType =
  | 'damage'
  | 'missing_accessory'
  | 'late_return'
  | 'scheduling_conflict'
  | 'safety_concern'
  | 'other';

export type IncidentStatus = 'open' | 'under_review' | 'resolved';

export interface IncidentReport {
  id: string;
  booking_id: string;
  resource_id: string;
  resource_title: string;
  reported_by_id: string;
  reported_by_name: string;
  reported_by_role: UserRole;
  type: IncidentType;
  description: string;
  evidence_refs: string[];
  status: IncidentStatus;
  resolution_note?: string;
  assigned_to?: string;
  resolved_at?: string;
  created_at: string;
}

export interface WaitlistEntry {
  id: string;
  resource_id: string;
  resource_title: string;
  requester_id: string;
  requester_name: string;
  requester_email: string;
  desired_start_at: string;
  desired_end_at: string;
  queue_position: number;
  status: 'waiting' | 'offered' | 'expired' | 'cancelled';
  created_at: string;
}

export interface NotificationItem {
  id: string;
  recipient_id: string;
  type:
    | 'booking_submitted'
    | 'booking_approved'
    | 'booking_rejected'
    | 'booking_cancelled'
    | 'return_reminder'
    | 'checked_out'
    | 'returned'
    | 'review_submitted'
    | 'incident_updated'
    | 'waitlist_available';
  title: string;
  body: string;
  related_booking_id?: string;
  related_resource_id?: string;
  read: boolean;
  created_at: string;
}

export interface AuditEvent {
  id: string;
  actor_id: string;
  actor_name: string;
  actor_role: string;
  action: string;
  entity_type: 'resource' | 'booking' | 'handover' | 'incident' | 'user';
  entity_id: string;
  entity_title: string;
  details: string;
  occurred_at: string;
}

export type ActiveView =
  | 'landing'
  | 'discover'
  | 'resource_details'
  | 'booking_request'
  | 'my_bookings'
  | 'borrower_dashboard'
  | 'booking_details'
  | 'owner_dashboard'
  | 'custodian_dashboard'
  | 'manage_resources'
  | 'add_resource'
  | 'edit_resource'
  | 'booking_approvals'
  | 'handover'
  | 'incidents'
  | 'manager_dashboard'
  | 'admin_dashboard'
  | 'notifications'
  | 'activity_history'
  | 'user_profile'
  | 'guidelines';
