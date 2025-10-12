// Angular core imports
import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';

// Custom services
import { FeedbackDeviceService } from '../../../../../services/feedback/feedback.service';
import { QuestionsService } from '../../../../../services/feedback/questions.service';

// Child component for location filtering
import { LocationFilterComponent } from './location-filter/location-filter.component';

// Translation imports
import { TranslateModule, TranslateService } from '@ngx-translate/core';

// Interface representing a feedback card's structure
interface FeedbackCard {
  title: string; // Title shown on the card
  value: string | number; // Dynamic value shown on the card (e.g. %, count)
  icon: string; // Icon identifier for internal usage
  iconPath: string; // Path to SVG/PNG file for display
  color?: string; // Optional card color (used for styling)
  hasFilter?: boolean; // Indicates if the card has a filter dropdown
  filterText?: string; // Text displayed on filter (e.g. "All Months")
  selectedMonth?: number; // For month-based filtering (1–12)
}

@Component({
  selector: 'app-feedback-cards',
  standalone: true, // Standalone component (Angular v14+ feature)
  imports: [CommonModule, LocationFilterComponent, TranslateModule], // Added TranslateModule
  templateUrl: './feedback-cards.component.html',
  styleUrls: ['./feedback-cards.component.scss'],
})
export class FeedbackCardsComponent implements OnInit {
  // Tracks the currently open filter dropdown index, if any
  activeFilterIndex: number | null = null;

  // Currently selected month filter (string 'all' or month number)
  selectedMonth: string | number = 'all';

  // Flag to control whether the location filter modal is visible
  showLocationFilter = false;

  // Array of all feedback summary cards
  cards: FeedbackCard[] = [
    {
      title: 'CUSTOMER_SATISFACTION_RATE',
      value: '--',
      icon: 'satisfaction',
      iconPath: 'assets/feedback-card-Customer.svg',
      color: '#49B848',
      hasFilter: true, // This card supports month filtering
      filterText: 'ALL_MONTHS',
    },
    {
      title: 'TOTAL_DEVICES',
      value: '--',
      icon: 'devices',
      iconPath: 'assets/feedback-card-Total Devices.svg',
      hasFilter: true, // This card supports location filtering
      filterText: 'FILTER',
    },
    {
      title: 'TOTAL_FEEDBACKS',
      value: '--',
      icon: 'feedbacks',
      iconPath: 'assets/feedback-card-Total Feedbacks.svg',
    },
    {
      title: 'TOTAL_QUESTIONS',
      value: '--',
      icon: 'questions',
      iconPath: 'assets/feedback-card-Total Questions.svg',
    },
  ];

  // Month names for filters - now using translation keys
  months = [
    'JANUARY',
    'FEBRUARY',
    'MARCH',
    'APRIL',
    'MAY',
    'JUNE',
    'JULY',
    'AUGUST',
    'SEPTEMBER',
    'OCTOBER',
    'NOVEMBER',
    'DECEMBER',
  ];

  constructor(
    private feedbackService: FeedbackDeviceService, // Service to fetch device & feedback data
    private questionsService: QuestionsService, // Service to fetch questions data
    private translate: TranslateService // Translation service
  ) {}

  // Lifecycle hook → load all cards data once component initializes
  ngOnInit(): void {
    this.loadAllData();
  }

  /**
   * Loads all cards data in parallel:
   * - Customer Satisfaction Rate
   * - Devices Count
   * - Total Feedbacks
   * - Total Questions
   */
  private loadAllData(): void {
    this.loadSatisfactionRate('all');
    this.loadDevicesCount();
    this.loadTotalAnswers();
    this.loadQuestionsCount();
  }

  /** Loads total questions count into its card */
  private loadQuestionsCount(): void {
    const card = this.cards.find((c) => c.icon === 'questions');
    if (!card) return;

    this.questionsService.getQuestionsCount().subscribe({
      next: (res) => {
        card.value = res?.succeeded && res.data != null ? res.data : '--';
      },
      error: () => {
        card.value = '--';
      },
    });
  }

  /** Loads total feedback answers into its card */
  private loadTotalAnswers(): void {
    const card = this.cards.find((c) => c.icon === 'feedbacks');
    if (!card) return;

    this.feedbackService.getTotalAnswers().subscribe({
      next: (res) => {
        card.value = res?.succeeded && res.data != null ? res.data : '--';
      },
      error: () => {
        card.value = '--';
      },
    });
  }

  /**
   * Triggered when location filter changes
   * Updates card filter text and reloads devices count
   */
  onLocationFilterChange(filterData: any): void {
    const devicesCard = this.cards.find((c) => c.icon === 'devices');
    if (devicesCard) {
      devicesCard.filterText = this.generateFilterText(filterData);
    }
    this.loadDevicesCount(filterData);
  }

  /** Loads devices count into its card, applying optional filters */
  private loadDevicesCount(filters?: any): void {
    const card = this.cards.find((c) => c.icon === 'devices');
    if (!card) return;

    const apiFilters = {
      AreaId: filters?.selectedArea,
      CityId: filters?.selectedCity,
      OrganizationId: filters?.selectedOrganization,
      BuildingId: filters?.selectedBuilding,
      FloorId: filters?.selectedFloor,
    };

    this.feedbackService.getDevicesCount(apiFilters).subscribe({
      next: (res) => {
        card.value = res?.succeeded && res.data != null ? res.data : '--';
      },
      error: () => {
        card.value = '--';
      },
    });
  }

  /** Helper → Generates readable filter text for the devices card */
  private generateFilterText(filterData: any): string {
    const filters = [];

    if (filterData.selectedArea)
      filters.push(
        `${this.translate.instant('AREA')} ${filterData.selectedArea}`
      );
    if (filterData.selectedCity)
      filters.push(
        `${this.translate.instant('CITY')} ${filterData.selectedCity}`
      );
    if (filterData.selectedOrganization)
      filters.push(
        `${this.translate.instant('ORGANIZATION')} ${
          filterData.selectedOrganization
        }`
      );
    if (filterData.selectedBuilding)
      filters.push(
        `${this.translate.instant('BUILDING')} ${filterData.selectedBuilding}`
      );
    if (filterData.selectedFloor)
      filters.push(
        `${this.translate.instant('FLOOR')} ${filterData.selectedFloor}`
      );

    return filters.length > 0
      ? filters.join(', ')
      : this.translate.instant('ALL_LOCATIONS');
  }

  /** Handles change of month filter via <select> dropdown */
  onMonthFilterChange(event: Event): void {
    const selectElement = event.target as HTMLSelectElement;
    const monthValue = selectElement.value;

    this.selectedMonth = monthValue;
    const monthNumber = monthValue === 'all' ? 'all' : parseInt(monthValue, 10);

    this.loadSatisfactionRate(monthNumber);
  }

  /** Loads satisfaction rate into its card (optionally filtered by month) */
  private loadSatisfactionRate(month: number | 'all'): void {
    const monthParam = month === 'all' ? undefined : month;
    const card = this.cards.find((c) => c.icon === 'satisfaction');
    if (!card) return;

    this.feedbackService.getHomeRate(monthParam).subscribe({
      next: (res) => {
        card.value = res?.succeeded ? `${res.data}%` : '--';
      },
      error: () => {
        card.value = '--';
      },
    });
  }

  /** Host listener → closes filter dropdowns when clicking outside */
  @HostListener('document:click')
  onDocumentClick(): void {
    this.activeFilterIndex = null;
  }

  /** Toggles a filter dropdown for a given card index */
  toggleFilter(index: number, event?: Event): void {
    event?.stopPropagation(); // Prevent document click from firing
    this.activeFilterIndex = this.activeFilterIndex === index ? null : index;
  }

  /** Selects a month for a card filter and reloads its data */
  selectMonth(
    card: FeedbackCard,
    month: string,
    monthIndex: number,
    event?: Event
  ): void {
    event?.stopPropagation();
    card.selectedMonth = monthIndex + 1;
    card.filterText = month;
    this.activeFilterIndex = null;
    this.loadCardData(card, monthIndex + 1);
  }

  /** Resets month filter to "All Months" for a card */
  selectAllMonths(card: FeedbackCard, event?: Event): void {
    event?.stopPropagation();
    card.selectedMonth = undefined;
    card.filterText = 'ALL_MONTHS';
    this.activeFilterIndex = null;
    this.loadCardData(card, 'all');
  }

  /** Returns the correct text for card filter display */
  getFilterDisplayText(card: FeedbackCard): string {
    if (
      card.selectedMonth &&
      card.selectedMonth >= 1 &&
      card.selectedMonth <= 12
    ) {
      return this.translate.instant(this.months[card.selectedMonth - 1]);
    }
    return this.translate.instant(card.filterText || 'FILTER');
  }

  /** Reloads card data depending on the card type (satisfaction, devices, etc.) */
  private loadCardData(card: FeedbackCard, month: number | 'all'): void {
    switch (card.icon) {
      case 'satisfaction':
        this.loadSatisfactionRate(month);
        break;
      case 'devices':
        // Future extension: Add device-specific month filtering here if needed
        break;
    }
  }

  /** Opens the location filter modal */
  openLocationFilter(): void {
    this.showLocationFilter = true;
  }

  /** Closes the location filter modal */
  closeLocationFilter(): void {
    this.showLocationFilter = false;
  }
}
