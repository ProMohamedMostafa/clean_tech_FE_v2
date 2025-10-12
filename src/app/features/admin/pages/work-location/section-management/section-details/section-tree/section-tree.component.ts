import {
  Component,
  OnInit,
  ViewChild,
  ElementRef,
  AfterViewInit,
  Input,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
import { Router } from '@angular/router';
import { CityService } from '../../../../../services/work-location/city.service';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import {
  faSearchMinus,
  faSearch,
  faSearchPlus,
  faSyncAlt,
} from '@fortawesome/free-solid-svg-icons';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { BuildingService } from '../../../../../services/work-location/building.service';
import { FloorService } from '../../../../../services/work-location/floor.service';
import { SectionService } from '../../../../../services/work-location/section.service';
import { getUserRole } from '../../../../../../../core/helpers/auth.helpers';

interface TreeNode {
  id: number;
  name: string;
  previousName?: string;
  device?: {
    id: number;
    name: string;
  } | null;
  points?: TreeNode[];
  expanded?: boolean;
}

@Component({
  selector: 'app-section-tree',
  imports: [FontAwesomeModule, FormsModule, CommonModule],
  templateUrl: './section-tree.component.html',
  styleUrl:'../../../area-management/area-details/location-tree/location-tree.component.scss',
})
export class SectionTreeComponent {
  @ViewChild('treeWrapper') treeWrapper!: ElementRef;

  @Input() sectionId: number | null = null;
  treeData: TreeNode[] = [];
  zoomLevel: number = 70;
  minZoom: number = 10;
  maxZoom: number = 200;
  zoomStep: number = 10;
  searchQuery: string = '';
  matches: TreeNode[] = [];
  isDragging: boolean = false;
  startX: number = 0;
  startY: number = 0;
  scrollLeft: number = 2000;
  scrollTop: number = 0;
  treeLoaded: boolean = false;

  // Font Awesome icons
  faSearchMinus = faSearchMinus;
  faSearch = faSearch;
  faSearchPlus = faSearchPlus;
  faSyncAlt = faSyncAlt;

  constructor(private sectionService: SectionService, private router: Router) {}

  ngOnInit(): void {
    if (this.sectionId) {
      this.loadCityTree(this.sectionId);
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['sectionId'] && changes['sectionId'].currentValue) {
      this.loadCityTree(changes['sectionId'].currentValue);
    }
  }

  ngAfterViewInit(): void {
    this.centerTree();
  }

  private centerTree(): void {
    if (!this.treeWrapper || !this.treeWrapper.nativeElement) return;

    setTimeout(() => {
      const wrapper = this.treeWrapper.nativeElement;
      const tree = wrapper.querySelector('.tree');

      if (tree) {
        const wrapperWidth = wrapper.clientWidth;
        const wrapperHeight = wrapper.clientHeight;
        const treeWidth = tree.scrollWidth;
        const treeHeight = tree.scrollHeight;

        wrapper.scrollTo({
          left: (treeWidth - wrapperWidth) / 2,
          top: (treeHeight - wrapperHeight) / 2,
          behavior: 'auto',
        });
      }
    }, 100);
  }

  private loadCityTree(sectionId: number): void {
    this.treeLoaded = false;
    this.sectionService.getSectionTreeById(sectionId).subscribe({
      next: (res) => {
        if (res?.data) {
          this.treeData = [this.buildTree(res.data)];
          this.treeLoaded = true;
          setTimeout(() => this.centerTree(), 0);
        }
      },
      error: (err) => {
        console.error('Error fetching city tree:', err);
        this.treeLoaded = false;
      },
    });
  }

  private buildTree(data: any): TreeNode {
    return {
      id: data.id,
      name: data.name,
      points:
        data.points?.map((point: any) => ({
          id: point.id,
          name: point.name,
          device: point.device || null,
        })) || [],
    };
  }

  // Rest of your methods remain the same...
  zoomIn(): void {
    if (this.zoomLevel < this.maxZoom) {
      this.zoomLevel += this.zoomStep;
    }
  }

  zoomOut(): void {
    if (this.zoomLevel > this.minZoom) {
      this.zoomLevel -= this.zoomStep;
    }
  }

  resetZoom(): void {
    this.zoomLevel = 70;
    this.centerTree();
  }

  onSearchInput(): void {
    if (!this.searchQuery) {
      this.matches = [];
      return;
    }

    const query = this.searchQuery.toLowerCase();
    this.matches = [];

    const searchInTree = (nodes: TreeNode[] | undefined) => {
      if (!nodes) return;

      for (const node of nodes) {
        if (node.name.toLowerCase().includes(query)) {
          this.matches.push(node);
        }

        if (node.points) searchInTree(node.points);
      }
    };

    searchInTree(this.treeData);
  }

  clearSearch(): void {
    this.searchQuery = '';
    this.matches = [];
  }

  isMatch(node: TreeNode): boolean {
    return this.matches.some((match) => match.id === node.id);
  }

  shouldPulse(node: TreeNode): boolean {
    return this.isMatch(node) && this.matches.length > 0;
  }

  startDrag(event: MouseEvent): void {
    this.isDragging = true;
    this.startX = event.pageX - this.treeWrapper.nativeElement.offsetLeft;
    this.startY = event.pageY - this.treeWrapper.nativeElement.offsetTop;
    this.scrollLeft = this.treeWrapper.nativeElement.scrollLeft;
    this.scrollTop = this.treeWrapper.nativeElement.scrollTop;
    event.preventDefault();
  }

  onDrag(event: MouseEvent): void {
    if (!this.isDragging) return;

    const x = event.pageX - this.treeWrapper.nativeElement.offsetLeft;
    const y = event.pageY - this.treeWrapper.nativeElement.offsetTop;
    const walkX = (x - this.startX) * 2;
    const walkY = (y - this.startY) * 2;

    this.treeWrapper.nativeElement.scrollLeft = this.scrollLeft - walkX;
    this.treeWrapper.nativeElement.scrollTop = this.scrollTop - walkY;
  }

  endDrag(): void {
    this.isDragging = false;
  }

  getRolePath(): string {
    return getUserRole().toLowerCase();
  }

  navigateToCity(id?: number): void {
    if (!id) return;
    this.router.navigate([`/${this.getRolePath()}/city-details`, id]);
  }

  navigateToOrganization(id: number): void {
    this.router.navigate([`/${this.getRolePath()}/organization-details`, id]);
  }

  navigateToBuilding(id: number): void {
    this.router.navigate([`/${this.getRolePath()}/building-details`, id]);
  }

  navigateToFloor(id: number): void {
    this.router.navigate([`/${this.getRolePath()}/floor-details`, id]);
  }

  navigateToSection(id: number): void {
    this.router.navigate([`/${this.getRolePath()}/section-details`, id]);
  }

  navigateToPoint(id: number): void {
    this.router.navigate([`/${this.getRolePath()}/point-details`, id]);
  }

  navigateToSensor(id: number): void {
    this.router.navigate([`/${this.getRolePath()}/sensor-details`, id]);
  }

  toggleNode(node: TreeNode): void {
    node.expanded = !node.expanded;
  }
}
