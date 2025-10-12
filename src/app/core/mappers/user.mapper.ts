// src/app/core/mappers/user.mapper.ts

export class UserMapper {
  // Field mapping for backend (PascalCase)
  private static readonly fieldMapping: Record<string, string> = {
    userName: 'UserName',
    firstName: 'FirstName',
    lastName: 'LastName',
    email: 'Email',
    phoneNumber: 'PhoneNumber',
    password: 'Password',
    passwordConfirmation: 'PasswordConfirmation',
    birthdate: 'Birthdate',
    gender: 'Gender',
    idNumber: 'IDNumber',
    nationalityName: 'NationalityName',
    countryName: 'CountryName',
    roleId: 'RoleId',
    managerId: 'ManagerId',
    providerId: 'ProviderId',
  };

  static toForm(user: any): any {
    console.log('🔄 UserMapper.toForm input:', user);

    const formData = {
      userName: user?.userName || '',
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      email: user?.email || '',
      phoneNumber: user?.phoneNumber || '',
      birthdate: this.formatDate(user?.birthdate || ''),
      idNumber: user?.idNumber || '',
      // Ensure nationality name is properly formatted
      nationalityName: this.formatNationalityName(user?.nationalityName || ''),
      countryName: user?.countryName || '',
      gender:
        user?.genderId !== null && user?.genderId !== undefined
          ? String(user.genderId)
          : '',
      roleId: user?.roleId || null,
      managerId: user?.managerId || null,
      providerId: user?.providerId || null,
    };

    console.log('🔄 UserMapper.toForm output:', formData);
    return formData;
  }

  // NEW METHOD: Format nationality name for consistency
  private static formatNationalityName(nationalityName: string): string {
    if (!nationalityName) return '';

    // Convert to lowercase and then capitalize first letter for consistency
    return (
      nationalityName.charAt(0).toUpperCase() +
      nationalityName.slice(1).toLowerCase()
    );
  }

  static toCreatePayload(formValues: any): FormData {
    const formData = new FormData();

    console.log('🔍 Creating payload from:', formValues);

    // Map form fields to backend field names
    Object.keys(formValues).forEach((key) => {
      if (key !== 'image') {
        const value = formValues[key];
        const mappedKey = this.fieldMapping[key] || key;

        if (Array.isArray(value)) {
          // Handle array values (TypeIds, ShiftIds)
          value.forEach((item) => {
            formData.append(`${mappedKey}`, item.toString());
          });
        } else {
          const finalValue =
            value !== null && value !== undefined ? value.toString() : '';
          formData.append(mappedKey, finalValue);
          console.log(`🔹 Mapping: ${key} -> ${mappedKey} = "${finalValue}"`);
        }
      }
    });

    // Handle image if present
    if (formValues.image && formValues.image instanceof File) {
      formData.append('Image', formValues.image);
      console.log('🔹 Added image file');
    }

    return formData;
  }

  static toUpdatePayload(
    formValues: any,
    userId: number,
    image: File | null,
    hasExistingImage: boolean
  ): FormData {
    const formData = new FormData();

    // Transform workLocationType and workLocationValue to Type and TypeIds
    const transformedValues = {
      ...formValues,
    };

    Object.keys(transformedValues).forEach((key) => {
      if (key !== 'image') {
        const value = transformedValues[key];
        const mappedKey = this.fieldMapping[key] || key;

        if (Array.isArray(value)) {
          // Handle array values (TypeIds, ShiftIds)
          value.forEach((item) => {
            formData.append(`${mappedKey}`, item.toString());
          });
        } else {
          formData.append(
            mappedKey,
            value !== null && value !== undefined ? value.toString() : ''
          );
        }
      }
    });

    formData.append('id', userId.toString());

    if (image) {
      formData.append('Image', image);
    } else if (!hasExistingImage) {
      formData.append('RemoveImage', 'true');
    }

    return formData;
  }

  private static formatDate(dateString: string): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
      2,
      '0'
    )}-${String(date.getDate()).padStart(2, '0')}`;
  }
}
