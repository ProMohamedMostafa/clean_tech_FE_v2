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
import { AreaService } from '../../../../../services/work-location/area.service';

import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import {
  faSearchMinus,
  faSearch,
  faSearchPlus,
  faSyncAlt,
} from '@fortawesome/free-solid-svg-icons';
import { getUserRole } from '../../../../../../../core/helpers/auth.helpers';

interface TreeNode {
  id: number;
  name: string;
  device?: {
    id: number;
    name: string;
  } | null;
  cities?: TreeNode[];
  organizations?: TreeNode[];
  buildings?: TreeNode[];
  floors?: TreeNode[];
  sections?: TreeNode[];
  points?: TreeNode[];
  expanded?: boolean;
}

@Component({
  selector: 'app-location-tree',
  standalone: true,
  imports: [FontAwesomeModule, FormsModule, CommonModule, TranslateModule],
  templateUrl: './location-tree.component.html',
  styleUrl: './location-tree.component.scss',
})
export class LocationTreeComponent implements OnInit, AfterViewInit, OnChanges {
  @ViewChild('treeWrapper') treeWrapper!: ElementRef;
  @Input() areaId!: number | null;

  profileData: any = {};
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
  scrollLeft: number = 0;
  scrollTop: number = 0;
  treeLoaded: boolean = false;

  // Font Awesome icons
  faSearch = faSearch;
  faSearchMinus = faSearchMinus;
  faSearchPlus = faSearchPlus;
  faSyncAlt = faSyncAlt;

  constructor(
    private areaService: AreaService,
    private router: Router,
    private translate: TranslateService
  ) {}

  ngOnInit(): void {
    if (this.areaId) {
      this.loadTreeStructure(this.areaId);
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['areaId'] && changes['areaId'].currentValue) {
      this.loadTreeStructure(changes['areaId'].currentValue);
    }
  }

  getRolePath(): string {
    return getUserRole().toLowerCase();
  }

  ngAfterViewInit(): void {
    // This will be called after the view is initialized
    if (this.treeLoaded) {
      this.centerTree();
    }
  }

  private centerTree(): void {
    setTimeout(() => {
      if (this.treeWrapper && this.treeWrapper.nativeElement) {
        const wrapper = this.treeWrapper.nativeElement;
        const tree = wrapper.querySelector('.tree');

        if (tree) {
          // Calculate center position
          const wrapperWidth = wrapper.clientWidth;
          const wrapperHeight = wrapper.clientHeight;
          const treeWidth = tree.scrollWidth;
          const treeHeight = tree.scrollHeight;

          // Center horizontally and vertically
          const centerX = (treeWidth - wrapperWidth) / 2;
          const centerY = (treeHeight - wrapperHeight) / 2;

          wrapper.scrollTo({
            left: centerX,
            top: centerY,
            behavior: 'auto',
          });
        }
      }
    }, 0);
  }

  private loadTreeStructure(areaId: number): void {
    this.areaService.getAreaTree(areaId).subscribe({
      next: (res) => {
        if (res?.succeeded && res.data) {
          this.treeData = [this.buildTree(res.data)];
          this.treeLoaded = true;
          this.centerTree(); // Center the tree after data is loaded
        } else {
          console.error('Failed to fetch area tree');
        }
      },
      error: (err) => console.error('Error fetching area tree:', err),
    });
  }

  private buildTree(data: any): TreeNode {
    return {
      id: data.id,
      name: data.name,
      cities: data.cities?.map((city: any) => ({
        id: city.id,
        name: city.name,
        organizations: city.organizations?.map((org: any) => ({
          id: org.id,
          name: org.name,
          buildings: org.buildings?.map((building: any) => ({
            id: building.id,
            name: building.name,
            floors: building.floors?.map((floor: any) => ({
              id: floor.id,
              name: floor.name,
              sections: floor.sections?.map((section: any) => ({
                id: section.id,
                name: section.name,
                points: section.points?.map((point: any) => ({
                  id: point.id,
                  name: point.name,
                  device: point.device
                    ? { id: point.device.id, name: point.device.name }
                    : null,
                })),
              })),
            })),
          })),
        })),
      })),
    };
  }

  // Zoom functionality
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
    if (this.treeWrapper) {
      this.treeWrapper.nativeElement.scrollTo({
        top: 0,
        left: 2000,
        behavior: 'smooth',
      });
    }
  }

  // Search functionality
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

        // Recursively search in all levels
        if (node.cities) searchInTree(node.cities);
        if (node.organizations) searchInTree(node.organizations);
        if (node.buildings) searchInTree(node.buildings);
        if (node.floors) searchInTree(node.floors);
        if (node.sections) searchInTree(node.sections);
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

  // Dragging/Panning functionality
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

  // Navigation methods
  navigateToArea(id: number): void {
    const rolePath = this.getRolePath();
    this.router.navigate([`/${rolePath}/area-details`, id]);
  }

  navigateToCity(id?: number): void {
    const rolePath = this.getRolePath();
    if (id) {
      this.router.navigate([`/${rolePath}/city-details`, id]);
    } else {
      console.warn('City ID is missing!');
    }
  }

  navigateToOrganization(id: number): void {
    const rolePath = this.getRolePath();
    this.router.navigate([`/${rolePath}/organization-details`, id]);
  }

  navigateToBuilding(id: number): void {
    const rolePath = this.getRolePath();
    this.router.navigate([`/${rolePath}/building-details`, id]);
  }

  navigateToFloor(id: number): void {
    const rolePath = this.getRolePath();
    this.router.navigate([`/${rolePath}/floor-details`, id]);
  }

  navigateToSection(id: number): void {
    const rolePath = this.getRolePath();
    this.router.navigate([`/${rolePath}/section-details`, id]);
  }

  navigateToPoint(id: number): void {
    const rolePath = this.getRolePath();
    this.router.navigate([`/${rolePath}/point-details`, id]);
  }

  navigateToSensor(id: number): void {
    const rolePath = this.getRolePath();
    this.router.navigate([`/${rolePath}/sensor-details`, id]);
  }



  
}
